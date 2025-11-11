
// EN: app/control-panel-7d8a2b3c4f5e/pending-posts/page.jsx

import { getPosts } from '@/app/lib/posts';
import ManagePendingPosts from '@/app/components/admin/ManagePendingPosts';
import { Suspense } from 'react';
import LoadingSpinner from '@/app/components/LoadingSpinner';

// Hacemos la página asíncrona para que pueda usar await
export default async function PendingPostsPage() {
    
    // 1. Obtenemos los datos aquí, en el servidor
    const { data: pendingPosts, error } = await getPosts({
        includeDrafts: false,
        includePending: true,
        status: 'pending' // Asegúrate de filtrar solo los pendientes
    });

    if (error) {
        console.error('Error fetching pending posts:', error);
        // Podrías mostrar un componente de error
        return <div>Error al cargar los posts pendientes.</div>;
    }

    // 2. Pasamos los datos como prop (ej. 'initialPosts') al componente de cliente
    return (
        <Suspense fallback={<LoadingSpinner />}>
            <ManagePendingPosts initialPosts={pendingPosts || []} />
        </Suspense>
    );
}