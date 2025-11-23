import { getSiteContent } from '@/app/lib/supabase/siteContent'; 
import PoliciesPageClient from './PoliciesPageClient'; 
import { Suspense } from 'react';
import { unstable_noStore as noStore } from 'next/cache';

// 1. Generación de Metadata
export async function generateMetadata() {
    return {
        title: 'Políticas - Zona Vortex',
        description: 'Políticas y términos de uso de Zona Vortex.',
    };
}

// 2. El Componente Page (Server Component)
export default async function PoliciesPage() {
    noStore(); // Forzamos Dynamic Rendering
    
    // Contenido de reserva en caso de fallo
    const fallbackContent = '<h1>Políticas</h1><p>No se pudo cargar el contenido de las políticas. Por favor, verifica la conexión a la base de datos y la configuración del panel de administración.</p>';
    
    let policiesContent = null;
    
    // Implementamos try...catch para manejar fallos de conexión
    try {
        // 3. Cargar datos en el servidor
        policiesContent = await getSiteContent('policies_page_content');
    } catch (error) {
        // En caso de error durante el build (p. ej., ENV vars)
        console.error("Error al cargar el contenido de políticas desde Supabase:", error);
        // policiesContent permanece en null, lo que usa el contenido de reserva
    }

    // Usamos el contenido cargado o el de reserva
    const content = policiesContent || fallbackContent;

    return (
        // 4. Usar Suspense para un fallback de carga
        <Suspense fallback={
            <div className="container mx-auto h-screen flex items-center justify-center">
                Cargando políticas...
            </div>
        }>
            {/* 5. Pasar los datos al Componente Cliente para que renderice la UI */}
            <PoliciesPageClient content={content} />
        </Suspense>
    );
}