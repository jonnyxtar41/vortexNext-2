"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { Menu, X, Home, MoreHorizontal, ChevronDown, Heart } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useLayout } from '@/app/context/LayoutContext.jsx';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/app/components/ui/dropdown-menu";
import * as Icons from 'lucide-react';
import { Button } from '@/app/components/ui/button';

const Header = ({ sections = [], siteContent = {} }) => {
    const { isSidePanelOpen, toggleSidePanel } = useLayout();
    const router = useRouter();
    const pathname = usePathname();

    const mainSections = sections.filter(s => s.is_main).sort((a, b) => a.order - b.order).slice(0, 3);
    const moreSections = sections.filter(s => !mainSections.some(ms => ms.id === s.id));

    const getIcon = (iconName) => {
        const Icon = Icons[iconName] || MoreHorizontal;
        return <Icon className="w-4 h-4" />;
    };

    return (
        <motion.header
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="sticky top-0 w-full z-30 glass-effect"
        >
            <nav className="px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={toggleSidePanel}
                            className="text-foreground z-50"
                            aria-label="Toggle Menu"
                        >
                            {isSidePanelOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="flex items-center space-x-2"
                        >
                            <Link href="/" className="flex items-center">
                                <img src="/logo.svg" alt="Zona Vortex Logo" className="h-10" />
                            </Link>
                        </motion.div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden lg:flex items-center space-x-6">
                            <Link
                                href="/"
                                className={`flex items-center gap-2 text-foreground hover:text-link-hover transition-colors font-medium ${pathname === '/' ? 'text-link' : ''}`}
                            >
                                <Home className="w-4 h-4" />
                                Inicio
                            </Link>
                            {mainSections.map((item) => (
                                <Link
                                    key={item.id}
                                    href={`/${item.slug}`}
                                    className={`flex items-center gap-2 text-foreground hover:text-link-hover transition-colors font-medium ${pathname === `/${item.slug}` ? 'text-link' : ''}`}
                                >
                                    {getIcon(item.icon)}
                                    {item.name}
                                </Link>
                            ))}
                            {moreSections.length > 0 && (
                                <DropdownMenu>
                                    <DropdownMenuTrigger className="flex items-center gap-2 text-foreground hover:text-link-hover transition-colors font-medium outline-none">
                                        Más...
                                        <ChevronDown className="w-4 h-4" />
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        {moreSections.map(item => (
                                            <DropdownMenuItem key={item.id} asChild>
                                                <Link href={`/${item.slug}`} className="flex items-center gap-2">
                                                    {getIcon(item.icon)}
                                                    {item.name}
                                                </Link>
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            )}
                        </div>

                        <div className="pl-4">
                            <Button
                                onClick={() => router.push('/donar')}
                                className="bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 text-white font-semibold rounded-full pulse-glow-orange"
                            >
                                <Heart className="w-4 h-4 mr-2" />
                                Apoyar
                            </Button>
                        </div>
                    </div>
                </div>
            </nav>
        </motion.header>
    );
};

export default Header;