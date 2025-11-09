"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Download, User, Calendar, ArrowRight } from 'lucide-react';
import { useDownloadModal } from '@/app/context/DownloadModalContext';
import AdBlock from '@/app/components/AdBlock';
import AdLink from '@/app/components/AdLink';
import CommentsSection from '@/app/components/CommentsSection';
import Image from 'next/image';
import Link from 'next/link';

// Helper para formatear la fecha (si no la recibes ya formateada)
const formatPostDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};


export default function PostClientPage({ post, relatedPosts }) {
    const { showDownloadModal } = useDownloadModal();

    const handleDownloadClick = () => {
        showDownloadModal({
            postId: post.id,
            postTitle: post.title,
            downloadUrl: post.download,
            imageUrl: post.main_image_url
        });
    };

    const postDate = formatPostDate(post.date);

    return (
        <main>
            <article>
                <AdBlock className="mt-8 mb-12" />
                
                {/* --- Encabezado del Post --- */}
                <motion.header 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="container mx-auto max-w-4xl text-center mb-12"
                >
                    {post.categories && (
                        <Link href={`/${post.sections.slug}/${post.categories.slug}`} className="inline-block mb-4">
                            <span className={`bg-gradient-to-r ${post.categories.gradient || 'from-gray-500 to-gray-700'} text-white text-sm font-semibold px-4 py-1 rounded-full`}>
                                {post.categories.name}
                            </span>
                        </Link>
                    )}
                    <h1 className="text-4xl lg:text-6xl font-bold mb-6">{post.title}</h1>
                    <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
                        {post.excerpt}
                    </p>
                    
                    {/* --- Meta Info (Autor/Fecha) --- */}
                    <div className="flex justify-center items-center gap-6 text-sm text-text-subtle">
                        {post.show_author && (
                            <div className="flex items-center space-x-1.5">
                                <User size={14} />
                                <span>{post.custom_author_name || 'Zona Vortex'}</span>
                            </div>
                        )}
                        {post.show_date && postDate && (
                            <div className="flex items-center space-x-1.5">
                                <Calendar size={14} />
                                <span>{postDate}</span>
                            </div>
                        )}
                    </div>
                </motion.header>

                {/* --- Imagen Principal --- */}
                {post.main_image_url && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1.0 }}
                        className="container mx-auto max-w-6xl mb-12 aspect-video"
                    >
                        <Image
                            src={post.main_image_url}
                            alt={post.image_description || post.title}
                            width={1200}
                            height={675}
                            className="rounded-2xl w-full h-full object-cover shadow-lg"
                            priority // Carga esta imagen primero
                        />
                    </motion.div>
                )}

                <AdBlock className="mb-12" />

                {/* --- Contenido del Post y Sidebar (simulado) --- */}
                <div className="container mx-auto max-w-6xl">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                        
                        {/* --- Contenido Principal --- */}
                        <div className="lg:col-span-8">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.2 }}
                                className="prose prose-lg dark:prose-invert max-w-none 
                                            prose-headings:font-bold prose-h2:text-3xl prose-h3:text-2xl 
                                            prose-a:text-primary hover:prose-a:text-primary/80
                                            prose-img:rounded-lg prose-img:shadow-md"
                                dangerouslySetInnerHTML={{ __html: post.content }}
                            />
                        </div>

                        {/* --- Sidebar (Posts Relacionados / Descarga) --- */}
                        <aside className="lg:col-span-4 space-y-8 sticky-sidebar">
                            
                            {/* Bloque de Descarga */}
                            {post.download && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.8, delay: 0.4 }}
                                    className="glass-effect p-6 rounded-2xl"
                                >
                                    <h3 className="text-2xl font-bold mb-4">Descarga el Recurso</h3>
                                    <p className="text-muted-foreground mb-6">Obtén el material complementario de este post.</p>
                                    <Button 
                                        onClick={handleDownloadClick} 
                                        className="w-full text-lg py-6"
                                    >
                                        <Download className="mr-2" />
                                        Descargar Ahora
                                    </Button>
                                </motion.div>
                            )}

                            {/* Posts Relacionados */}
                            {relatedPosts && relatedPosts.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.8, delay: 0.5 }}
                                    className="glass-effect p-6 rounded-2xl"
                                >
                                    <h3 className="text-2xl font-bold mb-6">Posts Relacionados</h3>
                                    <div className="space-y-6">
                                        {relatedPosts.map((p) => (
                                            <AdLink 
                                                key={p.id} 
                                                href={`/post/${p.slug}`} // ¡Ruta correcta de Next.js!
                                                className="block group card-hover p-4 rounded-lg -m-4"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <Image
                                                        src={p.main_image_url || '/logo.svg'}
                                                        alt={p.title}
                                                        width={80}
                                                        height={80}
                                                        className="rounded-lg object-cover w-20 h-20 flex-shrink-0"
                                                    />
                                                    <div>
                                                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full text-white bg-gradient-to-r ${p.categories?.gradient || 'from-gray-500 to-gray-700'}`}>
                                                            {p.categories?.name || 'General'}
                                                        </span>
                                                        <h4 className="font-bold text-md mt-1.5 group-hover:text-primary transition-colors">
                                                            {p.title}
                                                        </h4>
                                                    </div>
                                                </div>
                                            </AdLink>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </aside>
                    </div>
                </div>
            </article>

            <AdBlock className="my-12" />

            {/* --- Sección de Comentarios --- */}
            <section className="container mx-auto max-w-4xl py-12">
                {post.comments_enabled ? (
                    <CommentsSection postId={post.id} />
                ) : (
                    <div className="text-center text-muted-foreground">
                        <p>Los comentarios están desactivados para esta publicación.</p>
                    </div>
                )}
            </section>
        </main>
    );
}