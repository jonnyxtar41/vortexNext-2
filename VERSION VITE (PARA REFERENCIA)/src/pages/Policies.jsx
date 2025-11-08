import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { getSiteContent } from '@/lib/supabase/siteContent';
import parse from 'html-react-parser';
import DOMPurify from 'dompurify';
import AdBlock from '@/components/AdBlock';
import { FileText, Megaphone } from 'lucide-react';

const Policies = () => {
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchContent = async () => {
            setLoading(true);
            const policiesContent = await getSiteContent('policies_page_content');
            setContent(policiesContent || '<h1>Políticas</h1><p>No se pudo cargar el contenido de las políticas. Por favor, configúralo en el panel de administración.</p>');
            setLoading(false);
        };
        fetchContent();
    }, []);

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

    const parseOptions = {
        replace: domNode => {
            if (domNode.name === 'iframe') {
                const { src, allow, allowfullscreen, frameborder, ...rest } = domNode.attribs;
                const props = {
                    ...rest,
                    src,
                    allow,
                    allowFullScreen: allowfullscreen === 'true',
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

    return (
        <>
            <Helmet>
                <title>Políticas - Zona Vortex</title>
                <meta name="description" content="Políticas y términos de uso de Zona Vortex." />
            </Helmet>
            <div className="bg-background text-foreground pt-12 pb-20">
                <div className="container mx-auto px-4 sm:px-6">
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
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

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                            <motion.main
                                variants={itemVariants}
                                className="lg:col-span-8"
                            >
                                <div className="glass-effect p-6 sm:p-10 rounded-2xl shadow-xl">
                                    {loading ? (
                                        <div className="space-y-4">
                                            <div className="h-8 bg-muted-foreground/20 rounded w-3/4 animate-pulse"></div>
                                            <div className="h-4 bg-muted-foreground/20 rounded w-full animate-pulse"></div>
                                            <div className="h-4 bg-muted-foreground/20 rounded w-full animate-pulse"></div>
                                            <div className="h-4 bg-muted-foreground/20 rounded w-5/6 animate-pulse"></div>
                                        </div>
                                    ) : (
                                        <div className="prose prose-invert max-w-none prose-lg prose-h1:text-3xl prose-h2:text-2xl prose-h1:font-bold prose-h2:font-semibold prose-a:text-primary hover:prose-a:text-primary/80 transition-colors">
                                            {parse(DOMPurify.sanitize(content, {
                                                ADD_TAGS: ['iframe', 'table', 'tbody', 'tr', 'td', 'th', 'thead', 'colgroup', 'col'],
                                                ADD_ATTR: ['style', 'class', 'colspan', 'rowspan', 'src', 'frameBorder', 'allow', 'allowFullScreen']
                                            }), parseOptions)}
                                        </div>
                                    )}
                                </div>
                            </motion.main>

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
                         <motion.div variants={itemVariants} className="mt-16">
                            <AdBlock adKey="footer-banner" variant="banner" />
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </>
    );
};

export default Policies;