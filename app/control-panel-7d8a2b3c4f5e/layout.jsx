'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation'; // Importar useRouter
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Home, PlusSquare, Edit, BarChart, Users, Palette, Shield, Settings, 
    FileText, DollarSign, MessageSquare, Folder, FileImage, Menu, X, 
    LogOut, UserCog, Database, Clock 
} from 'lucide-react';

import { useToast } from '@/app/components/ui/use-toast';
import { useAuth } from '@/app/contexts/SupabaseAuthContext';
import LoadingSpinner from '@/app/components/LoadingSpinner';

const AdminLayout = ({ children }) => {
    // Obtenemos el estado de carga y el usuario. Renombramos 'loading' a 'authLoading'
    const { user, permissions, signOut, isSuperAdmin, loading: authLoading } = useAuth(); 
    const { toast } = useToast();
    const pathname = usePathname();
    const router = useRouter(); // Inicializamos el router
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const navItems = [
        { href: '/control-panel-7d8a2b3c4f5e/dashboard', icon: Home, label: 'Dashboard', permission: 'dashboard' },
        { href: '/control-panel-7d8a2b3c4f5e/add-resource', icon: PlusSquare, label: 'Añadir Recurso', permission: 'add-resource' },
        { href: '/control-panel-7d8a2b3c4f5e/pending-posts', icon: Clock, label: 'Posts Pendientes', permission: 'can_publish_posts' },
        { href: '/control-panel-7d8a2b3c4f5e/manage-content', icon: Edit, label: 'Gestionar Contenido', permission: 'manage-content' },
        { href: '/control-panel-7d8a2b3c4f5e/analytics', icon: BarChart, label: 'Estadísticas', permission: 'analytics' },
        { href: '/control-panel-7d8a2b3c4f5e/payments', icon: DollarSign, label: 'Monetización', permission: 'payments' },
        { href: '/control-panel-7d8a2b3c4f5e/manage-users', icon: Users, label: 'Gestionar Usuarios', permission: 'manage-users' },
        { href: '/control-panel-7d8a2b3c4f5e/manage-roles', icon: UserCog, label: 'Gestionar Roles', permission: 'manage-roles' },
        { href: '/control-panel-7d8a2b3c4f5e/manage-theme', icon: Palette, label: 'Gestionar Tema', permission: 'manage-theme' },
        { href: '/control-panel-7d8a2b3c4f5e/manage-site-content', icon: FileText, label: 'Contenido del Sitio', permission: 'manage-site-content' },
        { href: '/control-panel-7d8a2b3c4f5e/manage-ads', icon: Folder, label: 'Gestionar Anuncios', permission: 'manage-ads' },
        { href: '/control-panel-7d8a2b3c4f5e/manage-assets', icon: FileImage, label: 'Gestionar Archivos', permission: 'manage-assets' },
        { href: '/control-panel-7d8a2b3c4f5e/manage-resources', icon: Database, label: 'Herramientas de Recursos', permission: 'manage-resources' },
        { href: '/control-panel-7d8a2b3c4f5e/manage-suggestions', icon: MessageSquare, label: 'Sugerencias', permission: 'manage-suggestions' },
        { href: '/control-panel-7d8a2b3c4f5e/activity-log', icon: Shield, label: 'Registro de Actividad', permission: 'activity-log' },
        { href: '/control-panel-7d8a2b3c4f5e/credentials', icon: Settings, label: 'Credenciales', permission: 'credentials' },
        { href: '#logout', icon: LogOut, label: 'Cerrar Sesión', action: signOut }
    ].filter(item => item.action || (permissions && permissions[item.permission]));

    // Check if the current path is the admin login page
    const isLoginPage = pathname === '/control-panel-7d8a2b3c4f5e';

useEffect(() => {
        // Si la autenticación no está cargando, no hay usuario, Y no estamos en la página de login...
        if (!authLoading && !user && !isLoginPage) {
            // ...redirigimos al login.
            router.replace('/control-panel-7d8a2b3c4f5e');
        }
    }, [authLoading, user, isLoginPage, router]);

    // Si es la página de login, renderízala sin el layout
    if (isLoginPage) {
        return <>{children}</>;
    }

    // Si la autenticación está cargando, muestra un spinner
    if (authLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <LoadingSpinner />
            </div>
        );
    }

    // Si la autenticación terminó pero no hay usuario, estamos en proceso de redirección.
    // Muestra el spinner para evitar un parpadeo del layout.
    if (!user) {
        return (
            <div className="flex justify-center items-center h-screen">
                <LoadingSpinner />
            </div>
        );
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
                            <li key={item.href}>
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
                                    <Link
                                        href={item.href}
                                        onClick={() => setIsSidebarOpen(false)}
                                        className={`flex items-center p-4 text-sm admin-sidebar-link ${pathname === item.href ? 'active' : ''}`}
                                    >
                                        <item.icon className="h-5 w-5" />
                                        <span className="ml-4">{item.label}</span>
                                    </Link>
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
                        {children}
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
