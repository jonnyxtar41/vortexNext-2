'use client';
import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { BookOpen, Download, Users, Zap, Globe, Award, Layers, Code, Mic, Film, PenTool, Brain } from 'lucide-react';

const iconMap = {
  default: Layers,
  Lecciones: BookOpen,
  Guías: Download,
  Conversación: Users,
  Ejercicios: Zap,
  Cultura: Globe,
  Certificaciones: Award,
  Gramática: PenTool,
  Vocabulario: Brain,
  Pronunciación: Mic,
  Programación: Code,
  Películas: Film,
};

const Features = ({ categories = [] }) => {
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
            Explora Nuestras{' '}
            <span className="gradient-text">Categorías</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Sumérgete en una gran variedad de temas y encuentra los recursos perfectos para llevar tu inglés al siguiente nivel.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category, index) => {
            const Icon = iconMap[category.name] || iconMap.default;
            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Link href={`/recursos?categoria=${encodeURIComponent(category.name)}`} className="block glass-effect rounded-2xl p-8 card-hover group h-full">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  
                  <h3 className="text-2xl font-bold mb-4 text-foreground">
                    {category.name}
                  </h3>
                  
                  <p className="text-muted-foreground leading-relaxed">
                    Explora todos los recursos y guías sobre {category.name}.
                  </p>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;