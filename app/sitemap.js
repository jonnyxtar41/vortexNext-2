import { createClient } from '@/app/utils/supabase/server';
import { getPublishedPostsSlugs } from '@/app/lib/supabase/posts'; 


export const revalidate = 7600;

// URL base de tu sitio
const BASE_URL = 'https://zonavortex.com';


const generateSlug = (str) => {
    if (!str) return '';
    // Elimina caracteres que no son alfanuméricos, guiones o espacios, 
    // reemplaza espacios y guiones bajos por un solo guion, y convierte a minúsculas.
    // Esto es un saneamiento robusto.
    return str.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
};


// Esta función se ejecuta en el servidor y crea el sitemap.xml
export default async function sitemap() {
    
    // Obtenemos el cliente de Supabase del servidor
    const supabase = createClient();

    // 1. URLs de Posts Dinámicos
    const posts = await getPublishedPostsSlugs(supabase);
    

    const postsUrls = posts.map(post => {
        
        const cleanedPostSlug = generateSlug(post.slug);
     
        
        return {
            url: `${BASE_URL}/post/${cleanedPostSlug}`,
            
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