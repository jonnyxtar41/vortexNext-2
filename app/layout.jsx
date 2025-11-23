// app/layout.jsx
import './globals.css';
import { Providers } from './providers';
import Script from 'next/script';
import { createClient } from '@/app/utils/supabase/server'; 
import { getAllSiteContent } from '@/app/lib/supabase/client'; 
// Importé getAllSiteContent del mismo lugar que tu app/(public)/layout.jsx

// 💡 PASO CLAVE: Función para generar metadatos dinámicos
export async function generateMetadata() {
  const supabase = createClient();
  const allContent = await getAllSiteContent(supabase);
  const contentMap = allContent.reduce((acc, item) => {
      acc[item.key] = item.value;
      return acc;
  }, {});
  
  const faviconUrl = contentMap.site_favicon;
  const siteName = contentMap.site_name || 'Vortex Next'; // Usar un valor por defecto si no existe

  return {
    title: {
        template: `%s | ${siteName}`,
        default: siteName,
    },
    // Configuración del favicon (íconos)
    icons: {
        icon: faviconUrl || '/favicon.ico', // Usará la URL de Supabase o caerá en el fallback estático
    },
    // Añade el resto de tu metadata (ej. descripción, robots, etc.)
  };
}
// -------------------------------------------------------------------

export default function RootLayout({ children }) {
  // El RootLayout ahora es responsable solo del <html> y <body>, 
  // ya que generateMetadata se encarga del <head>.
  return (
    <html lang="es" suppressHydrationWarning={true}>
      <Script
            async
            src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5631795975075125"
            crossOrigin="anonymous"
        />
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}