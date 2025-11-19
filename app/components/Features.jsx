'use client';
import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  BookOpen, Download, Users, Zap, Globe, Award, 
  Layers, PenTool, FileText, Plane, Briefcase, Home 
} from 'lucide-react';

// Mapa de íconos actualizado para cubrir temas de migración y generales
const iconMap = {
  default: Layers,
  // Términos comunes de migración
  'visas': FileText,
  'residencia': Home,
  'ciudadania': Globe,
  'trabajo': Briefcase,
  'viajes': Plane,
  // Términos heredados o genéricos
  'lecciones': BookOpen,
  'guías': Download,
  'conversación': Users,
  'ejercicios': Zap,
  'cultura': Globe,
  'certificaciones': Award,
  'gramática': PenTool,
};

const Features = ({ categories = [] }) => {
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
          <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-black-600 dark:text-black-400">
            Explora Nuestras{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              Categorías
            </span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-800 max-w-3xl mx-auto">
            Encuentra toda la información, trámites y recursos necesarios organizados por tema.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category, index) => {
                // Normalizamos el nombre para buscar el icono (minúsculas)
                // console.log("Categorias:",category); // Mantener este o el nuevo para depurar
                const iconKey = category.name?.toLowerCase() || 'default';
                const Icon = iconMap[iconKey] || iconMap.default;
                
                // --- INICIO DE CAMBIO PARA ROBUSTEZ Y DEBUG ---
                const categoryName = category.name?.trim() || ''; // Usamos .trim() para evitar errores por espacios
                
                // Generamos el slug si no viene en la data (fallback)
                const targetHref = categoryName 
                    ? `/explorar?cat=${encodeURIComponent(categoryName)}`
                    : '/explorar';
                    
                // AGREGAR ESTE CONSOLE.LOG PARA VERIFICAR LA URL GENERADA EN LA CONSOLA DEL CLIENTE
                console.log(`[DEBUG ZONA VORTEX] Clic en categoría: "${categoryName}" -> Enlace generado: "${targetHref}"`);
                // --- FIN DE CAMBIO PARA ROBUSTEZ Y DEBUG ---
            
            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                {/* ENLACE DINÁMICO CORREGIDO */}
                
                <Link 
                  href={targetHref} // Usa la ruta segura
                  className="block bg-white dark:bg-gray-600 rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100 dark:border-gray-600 h-full group"
                >
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  
                  <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                    {category.name || 'Categoría Desconocida'}
                  </h3>
                  
                  <p className="text-gray-500 dark:text-gray-400 leading-relaxed">
                    Explora todos los recursos, artículos y guías sobre {category.name}.
                  </p>
                </Link >
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;