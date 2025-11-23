import { createClient } from '@/app/utils/supabase/server';
import { getPublishedPostsSlugs } from '@/app/lib/supabase/posts'; 

// URL base de tu sitio
const BASE_URL = 'https://zonavortex.com';

// Esta función se ejecuta en el servidor y crea el sitemap.xml
export default async function sitemap() {
    
    // Obtenemos el cliente de Supabase del servidor
    const supabase = createClient();

    // 1. URLs de Posts Dinámicos
    const posts = await getPublishedPostsSlugs(supabase);

    const postsUrls = posts.map(post => {
        // Usa el slug de la sección o 'blog' como fallback
        const sectionSlug = post.sections?.[0]?.slug || 'blog';
        
        return {
            url: `${BASE_URL}/${sectionSlug}/${post.slug}`,
            lastModified: post.created_at ? new Date(post.created_at).toISOString() : new Date().toISOString(),
            changeFrequency: 'weekly',
            priority: 0.64,
        };
    });

    // 2. URLs Estáticas Principales (ajusta estas según sea necesario)
    const staticUrls = [
        {
            url: `${BASE_URL}/`,
            lastModified: new Date().toISOString(),
            changeFrequency: 'always',
            priority: 1.00,
        },
        {
            url: `${BASE_URL}/recursos`,
            lastModified: new Date().toISOString(),
            changeFrequency: 'monthly',
            priority: 0.80,
        },
        {
            url: `${BASE_URL}/donar`, // Página de Donar
            lastModified: new Date().toISOString(),
            changeFrequency: 'monthly',
            priority: 0.5,
        },
        {
            url: `${BASE_URL}/policies`, // Página de Políticas
            lastModified: new Date().toISOString(),
            changeFrequency: 'monthly',
            priority: 0.5,
        },
        {
            url: `${BASE_URL}/suggestions`, // Página de Sugerencias
            lastModified: new Date().toISOString(),
            changeFrequency: 'monthly',
            priority: 0.5,
        },
        // Puedes añadir aquí otras rutas estáticas importantes...
    ];

    return [
        ...staticUrls,
        ...postsUrls,
    ];
}