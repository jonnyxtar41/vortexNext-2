// app/(public)/post/[slug]/page.jsx

import { getPostBySlug, getRelatedPosts } from '@/app/lib/supabase/posts'; // ¡Importa getRelatedPosts!
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import PostClientPage from '@/app/components/PostClientPage'; // ¡Importa el nuevo componente cliente!

// --- Generación de Metadata (SEO) ---
// (Tu función generateMetadata está perfecta, no la cambies)
export async function generateMetadata({ params }) {
    const post = await getPostBySlug(params.slug);
    if (!post) {
        return {
            title: 'No encontrado - Zona Vortex',
            description: 'El contenido que buscas no está disponible.'
        };
    }
    return {
        title: `${post.title} - Zona Vortex`,
        description: post.excerpt,
        openGraph: {
            title: `${post.title} - Zona Vortex`,
            description: post.excerpt,
            images: [
                {
                    url: post.main_image_url || '/logo.svg', 
                    width: 1200,
                    height: 630,
                    alt: post.title,
                },
            ],
        },
    };
}

// --- El Componente Page (Server Component) ---
export default async function PostPage({ params }) {
    const { slug } = params;
    
    // --- 1. Cargar Datos del Post ---
    const post = await getPostBySlug(slug);
    
    // Si no hay post, 404
    if (!post) {
        notFound();
    }

    // --- 2. Cargar Posts Relacionados ---
    // Usamos los keywords del post principal para encontrar posts similares
    const relatedPosts = await getRelatedPosts(post.id, post.keywords, 3); // Limita a 3

    // --- 3. Renderizar Componente Cliente ---
    return (
        <Suspense fallback={
            <div className="container mx-auto h-screen flex items-center justify-center">
                Cargando post...
            </div>
        }>
            {/* Pasa los datos del servidor (post y relatedPosts) 
                al componente cliente que maneja la UI.
            */}
            <PostClientPage post={post} relatedPosts={relatedPosts} />
        </Suspense>
    );
}