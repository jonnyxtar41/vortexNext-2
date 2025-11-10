
import React, { useState, useEffect, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Helmet, HelmetProvider } from 'react-helmet-async';

// Contexts
import { ThemeProvider } from '@/context/ThemeContext';
import { LayoutProvider } from '@/context/LayoutContext';
import { AdProvider } from '@/context/AdContext';
import { DownloadModalProvider } from '@/context/DownloadModalContext';
import { useAuth } from '@/contexts/SupabaseAuthContext';

// UI Components
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/toaster';
import LoadingSpinner from '@/components/LoadingSpinner';
import Layout from '@/components/Layout';
import PushNotificationManager from '@/components/PushNotificationManager';
import CookieConsent from '@/components/CookieConsent';
import InterstitialAd from '@/components/InterstitialAd';
import DownloadModal from '@/components/DownloadModal';

// Page Components (lazy loaded)
const Home = React.lazy(() => import('@/pages/Home'));
const Recursos = React.lazy(() => import('@/pages/Recursos'));
const Post = React.lazy(() => import('@/pages/Post'));
const Suggestions = React.lazy(() => import('@/pages/Suggestions'));
const Policies = React.lazy(() => import('@/pages/Policies'));
const Donate = React.lazy(() => import('@/pages/Donate'));
const Checkout = React.lazy(() => import('@/pages/Checkout'));
const PayPhoneCallback = React.lazy(() => import('@/pages/PayPhoneCallback'));
const Login = React.lazy(() => import('@/pages/Login'));
const RequestPasswordReset = React.lazy(() => import('@/pages/RequestPasswordReset'));
const UpdatePassword = React.lazy(() => import('@/pages/UpdatePassword'));
const Admin = React.lazy(() => import('@/pages/Admin'));
const EditPost = React.lazy(() => import('@/pages/EditPost'));
const ManagePendingPosts = React.lazy(() => import('@/pages/admin/ManagePendingPosts'));

// Lib
import { getSections } from '@/lib/supabase/sections';
import { getAllSiteContent } from '@/lib/supabase/siteContent';

// Rutas (deberían estar en un archivo de configuración)
const privateAdminPath = '/control-panel-7d8a2b3c4f5e';
const privateLoginPath = '/login-7d8a2b3c4f5e';

const LoadingFallback = () => (
  <div className="w-full h-screen flex items-center justify-center bg-background">
    <LoadingSpinner className="text-primary" />
  </div>
);

// Componente para Rutas Privadas
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingFallback />;
  }

  if (!user) {
    return <Navigate to={privateLoginPath} state={{ from: location }} replace />;
  }

  return children;
};


function App() {
  const [sections, setSections] = useState([]);
  const [siteContent, setSiteContent] = useState({});
  const [faviconKey, setFaviconKey] = useState(Date.now());
  const [isLoading, setIsLoading] = useState(true);

  const fetchInitialData = async () => {
    const sectionsData = await getSections();
    const allContent = await getAllSiteContent();
    const contentMap = allContent.reduce((acc, item) => {
        acc[item.key] = item.value;
        return acc;
    }, {});

    setSections(sectionsData);
    setSiteContent(contentMap);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const handleContentUpdate = () => {
    fetchInitialData();
    setFaviconKey(Date.now());
  };

  const faviconUrl = siteContent['site_favicon'] 
    ? `${siteContent['site_favicon'].replace(/^http:/, 'https:')}?v=${faviconKey}` 
    : '/favicon.svg';
    
  // Elemento que envuelve las rutas públicas
  const PublicLayout = ({ children }) => (
    <Layout sections={sections} siteContent={siteContent}>
      <PushNotificationManager frequencyDays={siteContent.notification_prompt_frequency_days} />
      <CookieConsent />
      {isLoading ? (
        <div className="w-full h-screen flex items-center justify-center bg-background">
          <LoadingSpinner className="text-primary" />
        </div>
      ) : (
        children
      )}
    </Layout>
  );

  return (
    <ThemeProvider>
      <TooltipProvider>
        <LayoutProvider>
          <AdProvider>
            <DownloadModalProvider>
              <Suspense fallback={<LoadingFallback />}>
                <Helmet>
                  <link rel="icon" type="image/svg+xml" href={faviconUrl} />
                </Helmet>
                <InterstitialAd />
                <DownloadModal />
                {isLoading ? (
                  <LoadingFallback />
                ) : (
                  <Routes>
                  {/* Rutas de Autenticación y Admin (sin el Layout principal) */}
                  <Route path={privateLoginPath} element={<Login />} />
                  <Route path="/request-password-reset" element={<RequestPasswordReset />} />
                  <Route path="/update-password" element={<UpdatePassword />} />
                  
                  <Route path={`${privateAdminPath}/*`} element={<PrivateRoute><Admin onContentUpdate={handleContentUpdate} /></PrivateRoute>} />
                  <Route path={`${privateAdminPath}/edit/:postSlug`} element={<PrivateRoute><EditPost /></PrivateRoute>} />
                  <Route path={`${privateAdminPath}/pending-posts`} element={<PrivateRoute><ManagePendingPosts /></PrivateRoute>} />

                  {/* Rutas Públicas (envueltas en el Layout) */}
                  <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
                  <Route
                    path={`/blog/*`}
                    element={
                      <PublicLayout>
                        <Routes>
                          <Route index element={<Recursos section={'blog'} />} />
                          <Route path=":postSlug" element={<Post section={'blog'} />} />
                        </Routes>
                      </PublicLayout>
                    }
                  />
                  {!isLoading && sections.map(section => (
                    <Route
                      key={section.id}
                      path={`/${section.slug}/*`}
                      element={
                        <PublicLayout>
                          <Routes>
                            <Route index element={<Recursos section={section.slug} />} />
                            <Route path=":postSlug" element={<Post section={section.slug} />} />
                          </Routes>
                        </PublicLayout>
                      }
                    />
                  ))}
                  <Route path="/sugerencias" element={<PublicLayout><Suggestions /></PublicLayout>} />
                  <Route path="/politicas" element={<PublicLayout><Policies /></PublicLayout>} />
                  <Route path="/donar" element={<PublicLayout><Donate /></PublicLayout>} />
                  <Route path="/checkout/:postSlug" element={<PublicLayout><Checkout /></PublicLayout>} />
                  <Route path="/payphone/callback" element={<PublicLayout><PayPhoneCallback /></PublicLayout>} />
                  
                  {/* Ruta comodín al final */}
                  <Route path="*" element={<Navigate to="/" />} />
                </Routes>)}
                <Toaster />
              </Suspense>
            </DownloadModalProvider>
          </AdProvider>
        </LayoutProvider>
      </TooltipProvider>
    </ThemeProvider>
  );
}

export default App;
