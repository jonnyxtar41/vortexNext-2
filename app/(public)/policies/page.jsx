// app/(public)/policies/page.jsx

import { getSiteContent } from '@/app/lib/supabase/siteContent'; // Usamos la función específica de Vite
import PoliciesPageClient from './PoliciesPageClient'; // Importamos el nuevo componente cliente
import { Suspense } from 'react';
import { unstable_noStore as noStore } from 'next/cache';

// 1. Generación de Metadata (reemplaza a Helmet de Vite)
export async function generateMetadata() {
    return {
        title: 'Políticas - Zona Vortex',
        description: 'Políticas y términos de uso de Zona Vortex.',
    };
}

// 2. El Componente Page (Server Component)
export default async function PoliciesPage() {
    noStore(); // Esta página es dinámica, no la queremos cachear estáticamente
    
    // 3. Cargar datos en el servidor
    // (Usamos la función de la versión Vite para ser precisos)
    const policiesContent = await getSiteContent('policies_page_content');
    const content = policiesContent || '<h1>Políticas</h1><p>No se pudo cargar el contenido de las políticas. Por favor, configúralo en el panel de administración.</p>';

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