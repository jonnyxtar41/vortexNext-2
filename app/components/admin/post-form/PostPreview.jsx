// app/components/admin/post-form/PostPreview.jsx
'use client';

import React, { useState } from 'react';
// import { Helmet } from 'react-helmet-async'; // Removed for Next.js
import { motion } from 'framer-motion';
import { Calendar, User, ChevronsRight, Smartphone, Monitor } from 'lucide-react';
import parse from 'html-react-parser';
import { Button } from '@/app/components/ui/button'; // Adjusted path
import { cn } from '@/app/lib/utils'; // Adjusted path

const PostPreview = ({ postData, sectionData, categoryData, subcategoryData }) => {
    const [previewMode, setPreviewMode] = useState('desktop'); // 'desktop' or 'mobile'

    const getImageSizeClass = (size) => {
        switch (size) {
            case 'small': return 'max-w-md mx-auto';
            case 'large': return 'w-full';
            case 'medium': default: return 'max-w-2xl mx-auto';
        }
    };

    const displayDate = postData.show_date
        ? (postData.published_at ? new Date(postData.published_at) : new Date()).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
        : '';

    return (
        <>
            {/* <Helmet>
                <title>Vista Previa: {postData.meta_title || postData.title}</title>
            </Helmet> */}
            <div className="bg-background text-foreground p-4 sm:p-8 rounded-lg border border-border">
                <div className="flex justify-center gap-2 mb-4">
                    <Button variant={previewMode === 'mobile' ? 'secondary' : 'ghost'} size="icon" onClick={() => setPreviewMode('mobile')}>
                        <Smartphone className="w-5 h-5" />
                    </Button>
                    <Button variant={previewMode === 'desktop' ? 'secondary' : 'ghost'} size="icon" onClick={() => setPreviewMode('desktop')}>
                        <Monitor className="w-5 h-5" />
                    </Button>
                </div>

                <div className={cn(
                    "mx-auto transition-all duration-300",
                    previewMode === 'mobile' ? 'max-w-sm w-full' : 'max-w-none w-full'
                )}>
                    <div className="border border-border rounded-lg overflow-hidden bg-background">
                        <main className="pt-8 pb-20">
                            <div className="container mx-auto px-4 sm:px-6">
                                <article>
                                    <motion.header
                                        initial={{ opacity: 0, y: 50 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.8 }}
                                        className="mb-12"
                                    >
                                        <div className="mb-4 flex items-center text-sm font-semibold text-foreground flex-wrap gap-2">
                                            {categoryData && (
                                                <span className={`bg-gradient-to-r ${categoryData.gradient || 'from-gray-500 to-gray-700'} px-4 py-1 rounded-full`}>
                                                    {categoryData.name}
                                                </span>
                                            )}
                                            {subcategoryData && (
                                                <>
                                                    <ChevronsRight className="w-5 h-5 text-text-subtle" />
                                                    <span className="bg-white/10 px-4 py-1 rounded-full">
                                                        {subcategoryData.name}
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                        <h1 className="text-3xl md:text-5xl font-bold mb-6">{postData.title || "Título de tu recurso"}</h1>
                                        <div className="flex items-center space-x-6 text-muted-foreground">
                                            {postData.show_author && (
                                                <div className="flex items-center space-x-2">
                                                    <User size={16} />
                                                    <span>{postData.custom_author_name || "Nombre del Autor"}</span>
                                                </div>
                                            )}
                                            {postData.show_date && (
                                                <div className="flex items-center space-x-2">
                                                    <Calendar size={16} />
                                                    <span>{displayDate}</span>
                                                </div>
                                            )}
                                        </div>
                                    </motion.header>

                                    {postData.show_main_image_in_post && postData.main_image_url && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ duration: 0.8, delay: 0.2 }}
                                            className={`mb-12 ${getImageSizeClass(postData.main_image_size_in_post)}`}
                                        >
                                            <img src={postData.main_image_url} className="w-full h-auto object-cover rounded-2xl shadow-2xl" alt={postData.image_description || postData.title} />
                                        </motion.div>
                                    )}

                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ duration: 0.8, delay: 0.4 }}
                                    >
                                        <div className="prose prose-invert prose-base lg:prose-lg max-w-none text-muted-foreground prose-headings:text-foreground prose-h2:text-3xl prose-p:leading-relaxed prose-a:text-link hover:prose-a:text-link-hover prose-img:rounded-xl">
                                            {postData.content ? parse(postData.content) : <p>Aquí se mostrará el contenido de tu recurso...</p>}
                                        </div>
                                    </motion.div>
                                </article>
                            </div>
                        </main>
                    </div>
                </div>
            </div>
        </>
    );
};

export default PostPreview;
