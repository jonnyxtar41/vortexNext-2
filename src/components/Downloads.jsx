'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { Download, FileText, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AdBlock from '@/components/AdBlock';
import Link from 'next/link';

const Downloads = ({ posts = [] }) => {
  return (
    <section className="py-20 px-6">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            Material{' '}
            <span className="gradient-text">Descargable</span>
          </h2>
          <p className="text-xl text-[hsl(var(--muted-foreground))] max-w-3xl mx-auto">
            Descarga nuestras guías, ejercicios y material de referencia para acelerar tu aprendizaje.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="glass-effect rounded-2xl overflow-hidden card-hover group flex flex-col"
            >
              <div className="relative">
                <img
                  className="w-full h-48 object-cover"
                  alt={post.image_description || `Material: ${post.title}`}
                  src={post.main_image_url || "https://images.unsplash.com/photo-1619390179735-fc8c18ac2a88"}
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                    <Download size={14} />
                    Download
                  </span>
                </div>
              </div>

              <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-xl font-bold mb-3 text-foreground group-hover:text-link-hover transition-colors">
                  {post.title}
                </h3>
                <p className="text-[hsl(var(--card-muted-foreground))] mb-4 text-sm leading-relaxed flex-grow">
                  {post.excerpt}
                </p>
                <div className="mt-auto">
                   <Link href={`/${post.sections?.slug || 'blog'}/${post.slug}`}>
                    <Button
                      variant="outline"
                      className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      Leer Más
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        {posts.length === 0 && (
            <p className="text-center text-muted-foreground mt-8">No hay materiales descargables disponibles en este momento.</p>
        )}

        <AdBlock className="mt-16" />
      </div>
    </section>
  );
};

export default Downloads;