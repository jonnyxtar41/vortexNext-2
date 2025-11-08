'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import AdLink from '@/components/AdLink';

const RecentPosts = ({ posts = [] }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <section className="py-20 px-6 bg-black/20">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            Lo Más <span className="gradient-text">Destacado</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Explora nuestras entradas más recientes y mantente al día con los mejores materiales de aprendizaje.
          </p>
        </motion.div>

        <motion.div
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {posts.map((post) => (
            <AdLink key={post.id} href={`/${post.sections?.slug || 'blog'}/${post.slug}`}>
              <motion.div
                variants={itemVariants}
                className="glass-effect rounded-2xl overflow-hidden flex flex-col group card-hover h-full"
              >
                <div className="overflow-hidden">
                  <img 
                    className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-500"
                    alt={post.image_description || `Imagen para ${post.title}`}
                    src={post.main_image_url || 'https://images.unsplash.com/photo-1606498679340-0aec3185edbd?q=80&w=2070&auto=format&fit=crop'}
                  />
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <div className="mb-4">
                    <span className={`bg-gradient-to-r ${post.categories?.gradient || 'from-gray-500 to-gray-700'} text-white text-xs font-semibold px-3 py-1 rounded-full`}>{post.categories?.name || 'General'}</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-foreground flex-grow">
                    {post.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    {post.excerpt}
                  </p>
                  <div className="flex justify-between items-center text-sm text-text-subtle mt-auto pt-4 border-t border-white/10">
                    <div className="flex items-center space-x-1.5">
                      <Calendar size={14} />
                      <span>{post.created_at ? new Date(post.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}</span>
                    </div>
                    <div className="flex items-center text-primary font-semibold">
                      Leer Más <ArrowRight className="w-4 h-4 ml-2" />
                    </div>
                  </div>
                </div>
              </motion.div>
            </AdLink>
          ))}
        </motion.div>
        
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            viewport={{ once: true }}
            className="text-center mt-16">
            <Button asChild className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-3 rounded-full text-base font-semibold">
                <Link href="/recursos-de-ingles">Ver todos los recursos</Link>
            </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default RecentPosts;
