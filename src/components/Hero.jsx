'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { Star, Users, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const Hero = ({ heroImageUrl }) => {
  return <section className="pt-32 pb-20 px-6">
      <div className="container mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div initial={{
          opacity: 0,
          x: -50
        }} animate={{
          opacity: 1,
          x: 0
        }} transition={{
          duration: 0.8
        }} className="space-y-8">
            <div className="space-y-4">
              <motion.div initial={{
              opacity: 0,
              y: 20
            }} animate={{
              opacity: 1,
              y: 0
            }} transition={{
              delay: 0.2
            }} className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full px-4 py-2 border border-blue-500/30">
                <Star className="w-4 h-4 text-special" />
                <span className="text-sm font-medium">Tu universo de conocimiento y curiosidad.</span>
              </motion.div>
              
              <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
                Explora, Aprende y Descubre en{' '}
                <span className="gradient-text">Zona Vortex</span>
              </h1>
              
              <p className="text-xl text-[hsl(var(--hero-muted-foreground))] leading-relaxed">
                Sumérgete en un portal de recursos, artículos y reseñas sobre tecnología, desarrollo personal, inglés y mucho más.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-4 rounded-full text-lg font-semibold pulse-glow">
                <Link href="/blog">
                  <BookOpen className="w-5 h-5 mr-2" />
                  Explorar Contenido
                </Link>
              </Button>
            </div>

            <div className="flex items-center space-x-8 pt-4">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-link" />
                <span className="text-sm text-[hsl(var(--muted-foreground))]">+10,000 usuarios</span>
              </div>
              <div className="flex items-center space-x-2">
                <Star className="w-5 h-5 text-special" />
                <span className="text-sm text-[hsl(var(--muted-foreground))]">4.9/5 valoración</span>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{
          opacity: 0,
          x: 50
        }} animate={{
          opacity: 1,
          x: 0
        }} transition={{
          duration: 0.8,
          delay: 0.2
        }} className="relative">
            <div className="floating-animation">
              <img className="w-full h-auto rounded-2xl shadow-2xl" alt="Universo de conocimiento y curiosidad" src={heroImageUrl || "https://horizons-cdn.hostinger.com/302fe7ec-cb94-4acf-acab-5d00c5484121/photo-1699373019849-3dc9158f7819-VOlzM.webp"} />
            </div>
            
            {/* Floating Cards */}
            <motion.div initial={{
            opacity: 0,
            scale: 0
          }} animate={{
            opacity: 1,
            scale: 1
          }} transition={{
            delay: 1,
            duration: 0.5
          }} className="absolute -top-4 -left-4 glass-effect rounded-xl p-4 floating-animation" style={{
            animationDelay: '1s'
          }}>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">✓</span>
                </div>
                <span className="text-sm font-medium">Nuevo artículo leído</span>
              </div>
            </motion.div>

            <motion.div initial={{
            opacity: 0,
            scale: 0
          }} animate={{
            opacity: 1,
            scale: 1
          }} transition={{
            delay: 1.2,
            duration: 0.5
          }} className="absolute -bottom-4 -right-4 glass-effect rounded-xl p-4 floating-animation" style={{
            animationDelay: '2s'
          }}>
              <div className="text-center">
                <div className="text-2xl font-bold gradient-text">95%</div>
                <div className="text-xs text-text-muted">Satisfacción</div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>;
};
export default Hero;