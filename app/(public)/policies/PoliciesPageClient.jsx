// app/(public)/policies/PoliciesPageClient.jsx
'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import parse from 'html-react-parser';
import DOMPurify from 'dompurify';
import AdBlock from '@/app/components/AdBlock'; // Asegúrate que la ruta a AdBlock sea correcta
import { FileText, Megaphone } from 'lucide-react';

// --- Lógica de Animación (de Vite) ---
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

// --- Lógica de Parseo (de Vite) ---
const parseOptions = {
    replace: domNode => {
        if (domNode.name === 'iframe') {
            const { src, allow, allowfullscreen, frameborder, ...rest } = domNode.attribs;
            const props = {
                ...rest,
                src,
                allow,
                allowFullScreen: allowfullscreen === 'true' || allowfullscreen === '',
                frameBorder: frameborder,
            };
            return (
            <div className="relative h-0 pb-[56.25%] overflow-hidden my-6">
                <iframe
                    {...props}
                    className="absolute top-0 left-0 w-full h-full"
                />
            </div>
            );
        }
    }
};

// --- Componente Cliente ---
// Recibe 'content' como prop del Server Component
export default function PoliciesPageClient({ content }) {

    const [sanitizedContent, setSanitizedContent] = useState('');

    // DOMPurify necesita el objeto 'window', por eso usamos useEffect
    // para sanitizar el HTML en el cliente.
    useEffect(() => {
        if (typeof window !== 'undefined') {
            setSanitizedContent(DOMPurify.sanitize(content, {
                ADD_TAGS: ['iframe', 'table', 'tbody', 'tr', 'td', 'th', 'thead', 'colgroup', 'col'],
                ADD_ATTR: ['style', 'class', 'colspan', 'rowspan', 'src', 'frameBorder', 'allow', 'allowFullScreen']
            }));
        }
    }, [content]);

    return (
        <div className="bg-background text-foreground pt-12 pb-20">
            <div className="container mx-auto px-4 sm:px-6">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {/* Header (de Vite) */}
                    <motion.header
                        variants={itemVariants}
                        className="text-center mb-16"
                    >
                        <FileText className="mx-auto h-16 w-16 text-primary mb-4" />
                        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight gradient-text">
                            Políticas del Sitio
                        </h1>
                        <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
                            Información importante sobre el uso de nuestros servicios y contenido.
                        </p>
                    </motion.header>

                    {/* Layout (de Vite) */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                        <motion.main
                            variants={itemVariants}
                            className="lg:col-span-8"
                        >
                            <div className="glass-effect p-6 sm:p-10 rounded-2xl shadow-xl">
                                {sanitizedContent ? (
                                    <div className="prose prose-invert max-w-none prose-lg prose-h1:text-3xl prose-h2:text-2xl prose-h1:font-bold prose-h2:font-semibold prose-a:text-primary hover:prose-a:text-primary/80 transition-colors">
                                        {parse(sanitizedContent, parseOptions)}
                                    </div>
                                ) : (
                                    // Esqueleto de carga mientras se sanitiza
                                    <div className="space-y-4">
                                        <div className="h-8 bg-muted-foreground/20 rounded w-3/Añadido animate-pulse"></div>
                                        <div className="h-4 bg-muted-foreground/20 rounded w-full animate-pulse"></div>
                                        <div className="h-4 bg-muted-foreground/20 rounded w-full animate-pulse"></div>
                                    </div>
                                )}
                            </div>
                        </motion.main>

                        {/* Sidebar (de Vite) */}
                        <motion.aside
                            variants={itemVariants}
                            className="lg:col-span-4"
                        >
                            <div className="sticky top-28 space-y-8">
                                <div className="glass-effect p-6 rounded-2xl">
                                     <h2 className="text-xl font-bold mb-4 flex items-center">
                                        <Megaphone className="mr-3 text-yellow-400" />
                                        Publicidad
                                    </h2>
                                    <AdBlock adKey="sidebar-top" />
                                </div>
                                <AdBlock adKey="post-body" />
                            </div>
                        </motion.aside>
                    </div>

                    {/* Ad inferior (de Vite) */}
                     <motion.div variants={itemVariants} className="mt-16">
                        <AdBlock adKey="footer-banner" variant="banner" />
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
}