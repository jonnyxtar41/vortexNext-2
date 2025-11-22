import { createClient } from '@/app/utils/supabase/server';
import { 
    getPostBySlug, 
    getRelatedPosts, 
    getPosts,
    getPopularPostsSlugs // <-- Nueva función para generateStaticParams
} from '@/app/lib/supabase/client'; // Asumiendo que getPopularPostsSlugs se exporta desde aquí
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import PostClientPage from '@/app/components/PostClientPage'; 

export const revalidate = 3600; 


// Función Helper para construir el JSON-LD (Artículo)
function generateArticleJsonLd(post) {
    const siteUrl = 'https://zonavortex.com';
    const postUrl = `${siteUrl}/post/${post.slug}`;
    
    // Se asume que 'post' tiene 'created_at' y 'updated_at' del backend (Supabase)
    const datePublished = post.created_at || new Date().toISOString(); 
    const dateModified = post.updated_at || datePublished; 

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        'mainEntityOfPage': {
            '@type': 'WebPage',
            '@id': postUrl,
        },
        'headline': post.title,
        'description': post.excerpt,
        'image': {
            '@type': 'ImageObject',
            'url': post.main_image_url || `${siteUrl}/logo.svg`,
            'width': 1200,
            'height': 630,
        },
        'datePublished': datePublished,
        'dateModified': dateModified,
        'author': {
            '@type': 'Person', // O 'Organization' si es un autor genérico del sitio
            'name': post.author?.name || 'Zona Vortex', // Utiliza el nombre del autor real si está disponible
        },
        'publisher': {
            '@type': 'Organization',
            'name': 'Zona Vortex',
            'logo': {
                '@type': 'ImageObject',
                'url': `${siteUrl}/logo.svg`, // Asumiendo que el logo está en /public
                'width': 60,
                'height': 60,
            },
        },
    };
    
    return JSON.stringify(jsonLd);
}

// --- Generación de Metadata (SEO) ---
// (Tu función generateMetadata está perfecta, no la cambies)
export async function generateMetadata({ params }) {
    const supabase = createClient();
    const post = await getPostBySlug(supabase, params.slug);
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

    const supabase = createClient();
    const { slug } = params;

    // 🎯 AGREGAR ESTE LOG
    console.log('--- DEBUG SLUG DESTINO ---');
    console.log('Slug recibido por la ruta dinámica:', slug);
    console.log('--------------------------');

    // --- 1. Cargar Datos del Post ---
    const post = await getPostBySlug(supabase, slug);
    
    if (!post) {
        notFound();
    }

    const jsonLd = generateArticleJsonLd(post);

    // --- 2. Cargar Posts Relacionados y Recomendados (Lógica de Vite migrada al servidor) ---
    const [
        { data: allPosts }, // Para "Recomendados"
        similarPostsData    // Para "Similares"
    ] = await Promise.all([
        getPosts(supabase, { section: post.sections?.slug, limit: 10 }), // Trae 10 para elegir aleatorios
        getRelatedPosts(supabase, post.id, post.keywords, 3) // Trae 3 por keywords
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
        <>
            {/* INYECCIÓN DEL JSON-LD PARA SEO */}
            <script 
                type="application/ld+json" 
                dangerouslySetInnerHTML={{ __html: jsonLd }}
            />
            {/* FIN JSON-LD */}

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
        </>
    );
}