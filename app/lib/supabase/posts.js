// --- ESTE ARCHIVO HA SIDO "LIMPIADO" ---
// Solo contiene funciones de LECTURA ('get...').
// Es seguro importarlo desde Componentes de Cliente.
// Toda la lógica de "escritura" se movió a 'app/lib/actions/post-actions.js'

import { supabase } from '@/app/lib/customSupabaseClient';
import { getSiteContent } from '@/app/lib/supabase/siteContent';

// Pega esto en app/lib/supabase/posts.js
// reemplazando la función getPosts existente
export const getPosts = async ({ 
    page = 1, 
    limit = 10, 
    section = null, 
    categoryName = null, 
    subcategoryName = null,
    searchQuery = null, 
    all = false,
    onlyDownloadable = false // Nuevo parámetro
}) => {


// --- INICIO DEBUG 2 ---
    console.log(`[DEBUG getPosts] Parámetros recibidos:`, { section, categoryName, subcategoryName, searchQuery, page, onlyDownloadable });
    // --- FIN DEBUG 2 ---
    let query = supabase
        .from('posts')
        .select(`
            id, title, slug, excerpt, main_image_url, date,
            show_date, show_author, custom_author_name, download,
            image_description,
            categories:categories ( name, gradient ),
            subcategories:subcategories ( name ),
            sections:sections!inner ( name, slug )
        `, { count: 'exact' }) 
        .eq('status', 'published')
        .order('date', { ascending: false });

    if (all) {
        query = query.range(0, 500);
    }

    // --- Filtros (¡Esta es la parte corregida!) ---
    if (section) {
        // Filtra por el slug de la tabla relacionada 'sections'
        query = query.eq('sections.slug', section);
        console.log(`[DEBUG getPosts] Filtrando por sección: ${section}`); // <-- DEBUG 
    }

    if (categoryName) {
        // Filtra por el NOMBRE de la tabla relacionada 'categories'
        query = query.eq('categories.name', categoryName);
    }
    
    if (subcategoryName) {
        // Filtra por el NOMBRE de la tabla relacionada 'subcategories'
        query = query.eq('subcategories.name', subcategoryName); 
    }
    
    if (searchQuery) {
        query = query.ilike('title', `%${searchQuery}%`);
    }

    // Nuevo filtro para descargables
    if (onlyDownloadable) {
        query = query.not('download', 'is', null);
    }

    // --- Paginación ---
    if (!all) {
        const from = (page - 1) * limit;
        const to = page * limit - 1;
        query = query.range(from, to);
    }

    const { data, error, count } = await query;

    console.log(`[DEBUG getPosts] Respuesta de Supabase:`, {
        count: count,
        error: error, // <-- Sospechoso #2 (RLS)
        dataLength: data ? data.length : 'sin datos'
    });
    // --- FIN DEBUG 3 ---

    if (error) {
        console.error('Error fetching posts:', error.message);
        return { data: [], count: 0, error };
    }

    // --- Formato de Fecha (de la versión de Vite) ---
    const formattedData = data.map(post => ({
        ...post,
        // Formatea la fecha para que el componente cliente la muestre bien
        date: new Date(post.date).toLocaleString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        }),
    }));

    return { data: formattedData, count, error: null };
};

export const getPostBySlug = async (slug) => {
    const { data, error } = await supabase
        .from('posts')
        .select(`
            *,
            sections (name, slug),
            categories (name, gradient, section_id),
            subcategories (name)
        `)
        .eq('slug', slug)
        .in('status', ['published', 'draft', 'pending_approval', 'scheduled'])
        .limit(1)
        .maybeSingle();

    if (error) {
        console.error('Error fetching post by slug:', error);
        return null;
    }
    
    return data;
};

export const getRandomPosts = async (count) => {
  const { data: posts, error } = await supabase
    .from('posts')
    .select('*, categories(name, gradient)')
    .eq('status', 'published');

  if (error) {
    console.error('Error fetching random posts:', error);
    return [];
  }

  const shuffled = posts.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

export const getRandomPostsWithImages = async (count) => {
  const { data: posts, error } = await supabase
    .from('posts')
      .select('*, categories(name, gradient), sections(slug)')
    .eq('status', 'published')
    .not('main_image_url', 'is', null)
    .neq('main_image_url', '');

  if (error) {
    console.error('Error fetching random posts with images:', error);
    return [];
  }

  const shuffled = posts.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

export const getAllPostStats = async () => {
    const { data, error } = await supabase
        .from('post_stats')
        .select('*');
    
    if (error) {
        console.error('Error fetching all post stats:', error);
        return [];
    }

    return data;
};

export const getDownloadablePosts = async (count) => {
  const { data, error } = await supabase
    .from('posts')
    .select('*, categories(name, gradient), sections(slug)')
    .eq('status', 'published')
    .not('download', 'is', null)
    .order('created_at', { ascending: false })
    .limit(count);

  if (error) {
    console.error('Error fetching downloadable posts:', error);
    return [];
  }

  return data;
};

export const getRelatedPosts = async (postId, keywords, limit = 3) => {
    if (!keywords || keywords.length === 0) {
        return [];
    }

    const { data, error } = await supabase
        .from('posts')
        .select('*, categories(name, gradient), sections(slug)')
        .eq('status', 'published')
        .neq('id', postId)
        .overlaps('keywords', keywords)
        .limit(limit);

    if (error) {
        console.error('Error fetching related posts:', error);
        return [];
    }
    
    return data;
};

export const getFeaturedPosts = async (options = {}) => {
    const { limit = 6 } = options;
    const { data, error } = await supabase
        .from('posts')
        .select('*, categories(name, gradient), sections(slug)')
        .eq('status', 'published')
        .eq('is_featured', true)
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) {
        console.error('Error fetching featured posts:', error);
        return [];
    }
    return data;
};

export const getPostImageUrls = async () => {
    const { data, error } = await supabase
        .from('posts')
        .select('main_image_url')
        .not('main_image_url', 'is', null)
        .neq('main_image_url', '');

    if (error) {
        console.error('Error fetching post image URLs:', error);
        return [];
    }

    return data?.map(post => post.main_image_url) || [];
};