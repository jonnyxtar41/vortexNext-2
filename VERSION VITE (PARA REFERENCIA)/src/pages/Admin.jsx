import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, NavLink, useLocation, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, PlusSquare, Edit, BarChart, Users, Palette, Shield, Settings, FileText, DollarSign, MessageSquare, Folder, FileImage, Menu, X, LogOut, UserCog, Database, Clock } from 'lucide-react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { getPosts } from '@/lib/supabase/posts';
import { getCategories } from '@/lib/supabase/categories';
import { getSections } from '@/lib/supabase/sections';
import { addPost, updatePost, addPostEdit } from '@/lib/supabase/posts';
import { useToast } from '@/components/ui/use-toast';
import { uploadSiteAsset } from '@/lib/supabase/assets';
import Dashboard from '@/pages/admin/Dashboard';
import PostForm from '@/pages/admin/PostForm';
import ManageContent from '@/pages/admin/ManageContent';
import Analytics from '@/pages/admin/Analytics';
import ManageUsers from '@/pages/admin/ManageUsers';
import ManageTheme from '@/pages/admin/ManageTheme';
import ActivityLog from '@/pages/admin/ActivityLog';
import ManagePayments from '@/pages/admin/ManagePayments';
import ManageSiteContent from '@/pages/admin/ManageSiteContent';
import ManageSuggestions from '@/pages/admin/ManageSuggestions';
import ManageAds from '@/pages/admin/ManageAds';
import ManageAssets from '@/pages/admin/ManageAssets';
import ManageCredentials from '@/pages/admin/ManageCredentials';
import ManageRoles from '@/pages/admin/ManageRoles';
import ManageResources from '@/pages/admin/ManageResources';
import { getSubcategories } from '@/lib/supabase/subcategories';

const Admin = ({ onContentUpdate }) => {
    const { user, permissions, loading: authLoading, signOut, isSuperAdmin } = useAuth();
    const { toast } = useToast();
    const location = useLocation();
    const [posts, setPosts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [subcategories, setSubcategories] = useState([]);
    const [sections, setSections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const fetchData = useCallback(async () => {
        setLoading(true);
        const [postsData, categoriesData, sectionsData, subcategoriesData] = await Promise.all([
            getPosts({ includeDrafts: true, includePending: true, limit: 1000 }),
            getCategories(),
            getSections(),
            getSubcategories()
        ]);
        setPosts(postsData.data || []);
        setCategories(categoriesData || []);
        setSections(sectionsData || []);
        setSubcategories(subcategoriesData || []);
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handlePostSave = async (postData, isEditing, initialData) => {
        try {
            let finalPostData = { ...postData };
            
            if (postData.download && postData.download.type === 'file' && postData.download.url.startsWith('#file-placeholder:')) {
                const fileName = postData.download.url.split(':')[1];
                const file = document.querySelector(`input[type="file"][data-file-name="${fileName}"]`)?.files[0];
                if (file) {
                    const filePath = `downloads/${Date.now()}-${file.name}`;
                    const downloadUrl = await uploadSiteAsset(file, filePath);
                    if (downloadUrl) {
                        finalPostData.download.url = downloadUrl;
                    } else {
                        throw new Error("Error al subir el archivo de descarga.");
                    }
                }
            }

            if (finalPostData.main_image_url && finalPostData.main_image_url.startsWith('blob:')) {
                const response = await fetch(finalPostData.main_image_url);
                const blob = await response.blob();
                const file = new File([blob], `main-image-${Date.now()}.jpg`, { type: 'image/jpeg' });
                const filePath = `post-images/${Date.now()}-${file.name}`;
                const imageUrl = await uploadSiteAsset(file, filePath);
                if (imageUrl) {
                    finalPostData.main_image_url = imageUrl;
                } else {
                    throw new Error("Error al subir la imagen principal.");
                }
            }

            if (isEditing) {
                if (permissions?.['manage-content']) {
                    await updatePost(initialData.id, finalPostData);
                    toast({ title: "✅ Recurso actualizado", description: "Los cambios han sido guardados." });
                } else {
                    const editData = {
                        post_id: initialData.id,
                        editor_id: user.id,
                        proposed_data: finalPostData,
                        status: 'pending'
                    };
                    await addPostEdit(editData);
                    toast({ title: "✅ Edición propuesta", description: "Tu edición ha sido enviada para revisión." });
                }
            } else {
                console.log('Saving new post with data:', { ...finalPostData, user_id: user.id });
                await addPost({ ...finalPostData, user_id: user.id });
                toast({ title: "✅ Recurso añadido", description: "El nuevo recurso ha sido guardado." });
            }
            fetchData();
            return true;
        } catch (error) {
            toast({ title: "❌ Error al guardar", description: error.message, variant: "destructive" });
            return false;
        }
    };

    const handleNewPost = () => {
        fetchData();
    };

    const navItems = [
        { to: 'dashboard', icon: Home, label: 'Dashboard', permission: 'dashboard' },
        { to: 'add-resource', icon: PlusSquare, label: 'Añadir Recurso', permission: 'add-resource' },
        { to: 'pending-posts', icon: Clock, label: 'Posts Pendientes', permission: 'can_publish_posts' },
        { to: 'manage-content', icon: Edit, label: 'Gestionar Contenido', permission: 'manage-content' },
        { to: 'analytics', icon: BarChart, label: 'Estadísticas', permission: 'analytics' },
        { to: 'payments', icon: DollarSign, label: 'Monetización', permission: 'payments' },
        { to: 'manage-users', icon: Users, label: 'Gestionar Usuarios', permission: 'manage-users' },
        { to: 'manage-roles', icon: UserCog, label: 'Gestionar Roles', permission: 'manage-roles' },
        { to: 'manage-theme', icon: Palette, label: 'Gestionar Tema', permission: 'manage-theme' },
        { to: 'manage-site-content', icon: FileText, label: 'Contenido del Sitio', permission: 'manage-site-content' },
        { to: 'manage-ads', icon: Folder, label: 'Gestionar Anuncios', permission: 'manage-ads' },
        { to: 'manage-assets', icon: FileImage, label: 'Gestionar Archivos', permission: 'manage-assets' },
        { to: 'manage-resources', icon: Database, label: 'Herramientas de Recursos', permission: 'manage-resources' },
        { to: 'manage-suggestions', icon: MessageSquare, label: 'Sugerencias', permission: 'manage-suggestions' },
        { to: 'activity-log', icon: Shield, label: 'Registro de Actividad', permission: 'activity-log' },
        { to: 'credentials', icon: Settings, label: 'Credenciales', permission: 'credentials' },
        { to: '#logout', icon: LogOut, label: 'Cerrar Sesión', action: signOut }
    ].filter(item => item.action || (permissions && permissions[item.permission]));

    if (authLoading || loading) {
        return <div className="flex justify-center items-center h-screen bg-background text-foreground">Cargando panel de administración...</div>;
    }

    return (
        <div className="flex h-screen bg-background text-foreground">
            <div className={`fixed inset-0 z-30 bg-black/50 md:hidden ${isSidebarOpen ? 'block' : 'hidden'}`} onClick={() => setIsSidebarOpen(false)}></div>
            <aside className={`admin-sidebar fixed top-0 left-0 h-full z-40 transition-transform duration-300 md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} w-64 flex flex-col`}>
                <div className="p-4 flex items-center justify-between flex-shrink-0">
                    <h1 className="text-2xl font-bold text-white">Admin</h1>
                    <button onClick={() => setIsSidebarOpen(false)} className="p-2 rounded-md hover:bg-gray-700 text-gray-300 md:hidden">
                        <X className="w-6 h-6" />
                    </button>
                </div>
                <div className="px-4 pb-4 border-t border-b border-gray-700">
                    <p className="text-sm font-medium text-white truncate pt-4" title={user?.email}>{user?.email}</p>
                    {isSuperAdmin && (
                        <span className="mt-2 inline-block bg-yellow-500 text-gray-900 text-xs font-bold px-2 py-1 rounded-full">
                            SuperAdmin
                        </span>
                    )}
                </div>
                <nav className="mt-4 flex-grow overflow-y-auto">
                    <ul>
                        {navItems.map(item => (
                            <li key={item.to}>
                                {item.action ? (
                                    <button
                                        onClick={() => {
                                            item.action();
                                            setIsSidebarOpen(false);
                                        }}
                                        className="flex items-center p-4 text-sm admin-sidebar-link w-full text-left"
                                    >
                                        <item.icon className="h-5 w-5" />
                                        <span className="ml-4">{item.label}</span>
                                    </button>
                                ) : (
                                    <NavLink
                                        to={item.to}
                                        onClick={() => setIsSidebarOpen(false)}
                                        className={({ isActive }) =>
                                            `flex items-center p-4 text-sm admin-sidebar-link ${isActive ? 'active' : ''}`
                                        }
                                    >
                                        <item.icon className="h-5 w-5" />
                                        <span className="ml-4">{item.label}</span>
                                    </NavLink>
                                )}
                            </li>
                        ))}
                    </ul>
                </nav>
            </aside>
            <div className="flex-1 flex flex-col">
                <header className="md:hidden sticky top-0 z-20 bg-background/80 backdrop-blur-sm p-4 flex items-center justify-between border-b border-border">
                    <button onClick={() => setIsSidebarOpen(true)} className="p-2 rounded-md hover:bg-secondary text-foreground">
                        <Menu className="w-6 h-6" />
                    </button>
                    <h2 className="text-lg font-semibold">Dashboard</h2>
                </header>
                <main className="flex-1 p-4 md:p-8 overflow-y-auto">
                    <AnimatePresence mode="wait">
                        <Routes location={location} key={location.pathname}>
                            <Route path="/" element={<Navigate to="dashboard" replace />} />
                            {permissions?.dashboard && <Route path="dashboard" element={<Dashboard user={user} posts={posts} categories={categories} sections={sections} />} />}
                            {permissions?.['add-resource'] && <Route path="add-resource" element={<PostForm sections={sections} onSave={handlePostSave} onNewPost={handleNewPost} />} />}
                            {permissions?.['can_publish_posts'] && <Route path="pending-posts" element={<ManagePendingPosts />} />}
                            {permissions?.['manage-content'] && <Route path="manage-content" element={<ManageContent posts={posts} categories={categories} sections={sections} onUpdate={fetchData} />} />}}
                            {permissions?.analytics && <Route path="analytics" element={<Analytics posts={posts} categories={categories} subcategories={subcategories} sections={sections} />} />}
                            {permissions?.payments && <Route path="payments" element={<ManagePayments />} />}
                            {permissions?.['manage-users'] && <Route path="manage-users" element={<ManageUsers />} />}
                            {permissions?.['manage-roles'] && <Route path="manage-roles" element={<ManageRoles />} />}
                            {permissions?.['manage-theme'] && <Route path="manage-theme" element={<ManageTheme onUpdate={onContentUpdate} />} />}
                            {permissions?.['activity-log'] && <Route path="activity-log" element={<ActivityLog />} />}
                            {permissions?.['manage-site-content'] && <Route path="manage-site-content" element={<ManageSiteContent onUpdate={onContentUpdate} />} />}
                            {permissions?.['manage-suggestions'] && <Route path="manage-suggestions" element={<ManageSuggestions />} />}
                            {permissions?.['manage-ads'] && <Route path="manage-ads" element={<ManageAds />} />}
                            {permissions?.['manage-assets'] && <Route path="manage-assets" element={<ManageAssets />} />}
                            {permissions?.['manage-resources'] && <Route path="manage-resources" element={<ManageResources />} />}
                            {permissions?.credentials && <Route path="credentials" element={<ManageCredentials />} />}
                        </Routes>
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
};

export default Admin;