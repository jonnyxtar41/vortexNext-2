import React from 'react';
import { useToast } from '@/components/ui/use-toast';

const Lessons = () => {
  const { toast } = useToast();

  React.useEffect(() => {
    toast({
      title: "🚧 Esta sección ha sido eliminada",
      description: "¡La funcionalidad de lecciones ya no está disponible en Zona Vortex! Ahora nos enfocamos en recursos y blog. 🚀"
    });
  }, [toast]);

  return (
    <section className="py-20 px-6 bg-black/20 text-center">
      <div className="container mx-auto">
        <h2 className="text-4xl lg:text-5xl font-bold mb-6 gradient-text">
          Sección de Lecciones Eliminada
        </h2>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
          Zona Vortex ahora se enfoca en ofrecerte los mejores recursos y artículos de blog para aprender inglés.
          ¡Explora nuestras nuevas secciones!
        </p>
      </div>
    </section>
  );
};

export default Lessons;