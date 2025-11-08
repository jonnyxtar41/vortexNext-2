'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, PlusSquare, Edit, BarChart, Users, Palette, Shield, Settings, FileText, DollarSign, MessageSquare, Folder, FileImage, Menu, X, LogOut, UserCog, Database, Clock } from 'lucide-react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';

const AdminLayout = ({ children }) => {
    const { user, permissions, loading: authLoading, signOut, isSuperAdmin } = useAuth();
    const { toast } = useToast();
    const pathname = usePathname();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const navItems = [
        { href: '/admin/dashboard', icon: Home, label: 'Dashboard', permission: 'dashboard' },
        { href: '/admin/add-resource', icon: PlusSquare, label: 'Añadir Recurso', permission: 'add-resource' },
        { href: '/admin/pending-posts', icon: Clock, label: 'Posts Pendientes', permission: 'can_publish_posts' },
        { href: '/admin/manage-content', icon: Edit, label: 'Gestionar Contenido', permission: 'manage-content' },
        { href: '/admin/analytics', icon: BarChart, label: 'Estadísticas', permission: 'analytics' },
        { href: '/admin/payments', icon: DollarSign, label: 'Monetización', permission: 'payments' },
        { href: '/admin/manage-users', icon: Users, label: 'Gestionar Usuarios', permission: 'manage-users' },
        { href: '/admin/manage-roles', icon: UserCog, label: 'Gestionar Roles', permission: 'manage-roles' },
        { href: '/admin/manage-theme', icon: Palette, label: 'Gestionar Tema', permission: 'manage-theme' },
        { href: '/admin/manage-site-content', icon: FileText, label: 'Contenido del Sitio', permission: 'manage-site-content' },
        { href: '/admin/manage-ads', icon: Folder, label: 'Gestionar Anuncios', permission: 'manage-ads' },
        { href: '/admin/manage-assets', icon: FileImage, label: 'Gestionar Archivos', permission: 'manage-assets' },
        { href: '/admin/manage-resources', icon: Database, label: 'Herramientas de Recursos', permission: 'manage-resources' },
        { href: '/admin/manage-suggestions', icon: MessageSquare, label: 'Sugerencias', permission: 'manage-suggestions' },
        { href: '/admin/activity-log', icon: Shield, label: 'Registro de Actividad', permission: 'activity-log' },
        { href: '/admin/credentials', icon: Settings, label: 'Credenciales', permission: 'credentials' },
        { href: '#logout', icon: LogOut, label: 'Cerrar Sesión', action: signOut }
    ].filter(item => item.action || (permissions && permissions[item.permission]));

    if (authLoading) {
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
