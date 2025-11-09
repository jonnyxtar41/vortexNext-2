// app/(public)/post/[slug]/page.jsx

// Importa todas las funciones de fetching que necesitas
import { 
    getPostBySlug, 
    getRelatedPosts, 
    getPosts // Necesitamos getPosts para los "Recomendados"
} from '@/app/lib/supabase/posts'; 
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import PostClientPage from '@/app/components/PostClientPage'; 
import { unstable_noStore as noStore } from 'next/cache';

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
        // Aquí puedes agregar los JSON-LD que tenías en VITE
        alternates: {
            canonical: `/post/${post.slug}`,
        },
    };
}

// --- El Componente Page (Server Component) ---
export default async function PostPage({ params }) {
    noStore(); // Evita que esta página se cachee estáticamente si necesitas visitas en tiempo real
    const { slug } = params;
    
    // --- 1. Cargar Datos del Post ---
    const post = await getPostBySlug(slug);
    
    if (!post) {
        notFound();
    }

    // --- 2. Cargar Posts Relacionados y Recomendados (Lógica de Vite migrada al servidor) ---
    const [
        { data: allPosts }, // Para "Recomendados"
        similarPostsData    // Para "Similares"
    ] = await Promise.all([
        getPosts({ section: post.sections?.slug, limit: 10 }), // Trae 10 para elegir aleatorios
        getRelatedPosts(post.id, post.keywords, 3) // Trae 3 por keywords
    ]);

    // Lógica de "Recomendados" (posts aleatorios de la sección)
    const recommendedPosts = allPosts
      .filter(p => p.id !== post.id && !similarPostsData.some(rp => rp.id === p.id))
      .slice(0, 4); // Tomar 4

    // Lógica de "Similares" (completa hasta 3 si faltan)
    let finalSimilarPosts = [...similarPostsData];
    if (finalSimilarPosts.length < 3) {
        const categoryPosts = allPosts
            .filter(p => 
                p.category_id === post.category_id && 
                p.id !== post.id && 
                !finalSimilarPosts.some(sp => sp.id === p.id)
            );
        finalSimilarPosts.push(...categoryPosts.slice(0, 3 - finalSimilarPosts.length));
    }
    
    // --- 3. Renderizar Componente Cliente ---
    return (
        <Suspense fallback={
            <div className="container mx-auto h-screen flex items-center justify-center">
                Cargando post...
            </div>
        }>
            {/* Pasamos TODOS los datos al componente cliente */}
            <PostClientPage 
                post={post} 
                relatedPosts={[]} // 'relatedPosts' ya no se usa, pasamos 'recommended' y 'similar'
                recommendedPosts={recommendedPosts}
                similarPosts={finalSimilarPosts}
            />
        </Suspense>
    );
}