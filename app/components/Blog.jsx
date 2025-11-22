'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { Calendar } from 'lucide-react';
import Link from 'next/link';
import  Button  from '@/app/components/ui/button';
import AdLink from '@/app/components/AdLink';

const Blog = ({ randomPosts = [] }) => {
  return (
    <section id="blog-section" className="py-20 px-6">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            Desde Nuestro <span className="gradient-text">Blog</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Descubre consejos, trucos y guías de nuestros expertos para llevar tu inglés al siguiente nivel.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-20 justify-center">
          {randomPosts.map((post, index) => (
            
            <AdLink key={post.id} href={`/post/${post.slug}`} className="cursor-pointer group flex justify-center">
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                viewport={{ once: true }}
              >
                <div style={{ perspective: '1000px' }}>
                  <motion.div 
                    className="book relative w-64 h-96"
                    whileHover="hover"
                  >
                    <motion.div 
                      className="book-cover absolute w-full h-full"
                      variants={{
                        initial: { transform: 'rotateY(0deg)' },
                        hover: { transform: 'rotateY(-30deg)' },
                      }}
                      transition={{ duration: 0.4, ease: 'easeOut' }}
                      style={{ transformOrigin: 'left', transformStyle: 'preserve-3d' }}
                    >
                      <img 
                        className="w-full h-full object-cover rounded-lg shadow-2xl"
                        alt={post.image_description || `Imagen de portada para ${post.title}`}
                        src={post.main_image_url}
                      />
                      <div className={`absolute inset-0 bg-gradient-to-t ${post.categories?.gradient || 'from-gray-500 to-gray-700'} opacity-50 rounded-lg`}></div>
                      <div className="absolute inset-0 p-6 flex flex-col justify-between">
                        <div>
                          <span className="bg-black/50 text-white text-xs font-semibold px-3 py-1 rounded-full">{post.categories?.name || 'General'}</span>
                        </div>
                        <h3 className="text-2xl font-bold text-white shadow-black [text-shadow:1px_1px_2px_var(--tw-shadow-color)]">{post.title}</h3>
                      </div>
                    </motion.div>
                    <motion.div 
                      className={`book-spine absolute w-10 h-96 bg-gradient-to-b ${post.categories?.gradient || 'from-gray-500 to-gray-700'} rounded-l-lg shadow-lg`}
                      variants={{
                        initial: { transform: 'translateX(0) rotateY(90deg)' },
                        hover: { transform: 'translateX(-20px) rotateY(90deg)' },
                      }}
                      transition={{ duration: 0.4, ease: 'easeOut' }}
                      style={{ transformOrigin: 'left' }}
                    >
                      <div className="w-full h-full flex items-end p-2">
                         <span className="text-white font-bold text-sm [writing-mode:vertical-rl] transform rotate-180">{post.title}</span>
                      </div>
                    </motion.div>
                    <div className="absolute w-full h-full bg-white/5 rounded-lg -z-10 transform translate-x-3 translate-y-3"></div>
                  </motion.div>
                  <div className="mt-6 text-center w-64">
                     <div className="flex justify-center items-center space-x-4 text-sm text-text-muted">
                        <div className="flex items-center space-x-1.5">
                          <Calendar size={14} />
                          <span>{post.created_at ? new Date(post.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}</span>
                        </div>
                     </div>
                  </div>
                </div>
              </motion.div>
            </AdLink>
          ))}
        </div>

        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            viewport={{ once: true }}
            className="text-center mt-20"
        >
            <Button asChild className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-3 rounded-full text-base font-semibold">
                <Link href="/recursos">Ver todos los recursos</Link>
            </Button>
        </motion.div>

      </div>
    </section>
  );
};

export default Blog;