// app/(public)/policies/PoliciesPageClient.jsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import parse from 'html-react-parser';
// ELIMINADO: import DOMPurify from 'dompurify'; (Ya no lo usamos aquí)
import AdBlock from '@/app/components/AdBlock';
import { FileText, Megaphone } from 'lucide-react';

// --- Lógica de Animación ---
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

// --- Lógica de Parseo ---
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
export default function PoliciesPageClient({ content }) {
    
    // NOTA: Asumimos que 'content' viene sanitizado desde el servidor (Server Component)
    // o desde la base de datos (gracias al fix de post-actions.js).
    // Esto hace la página mucho más rápida al eliminar cálculos en el navegador.

    return (
        <div className="bg-background text-foreground pt-12 pb-20">
            <div className="container mx-auto px-4 sm:px-6">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {/* Header */}
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

                    {/* Layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                        <motion.main
                            variants={itemVariants}
                            className="lg:col-span-8"
                        >
                            <div className="glass-effect p-6 sm:p-10 rounded-2xl shadow-xl">
                                {/* Renderizado directo sin espera de sanitización cliente */}
                                <div className="prose prose-invert max-w-none prose-lg prose-h1:text-3xl prose-h2:text-2xl prose-h1:font-bold prose-h2:font-semibold prose-a:text-primary hover:prose-a:text-primary/80 transition-colors">
                                    {content ? parse(content, parseOptions) : (
                                        <div className="space-y-4">
                                            <p className="text-muted-foreground">Cargando contenido...</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.main>

                        {/* Sidebar */}
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

                    {/* Ad inferior */}
                     <motion.div variants={itemVariants} className="mt-16">
                        <AdBlock adKey="footer-banner" variant="banner" />
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
}