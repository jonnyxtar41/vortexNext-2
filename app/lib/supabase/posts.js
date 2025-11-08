
import { supabase } from '@/app/lib/customSupabaseClient';
import { logActivity } from '@/app/lib/supabase/log';
import { sendSuperadminNotificationEmail } from '@/app/lib/supabase/email';
import { getSiteContent } from '@/app/lib/supabase/siteContent';




// Pega esto en app/lib/supabase/posts.js
// reemplazando la función getPosts existente
export const getPosts = async ({ 
    page = 1, 
    limit = 10, 
    section = null, 
    categoryName = null, 
    subcategoryName = null, // ¡Ahora se incluye!
    searchQuery = null, 
    all = false 
}) => {


// --- INICIO DEBUG 2 ---
    console.log(`[DEBUG getPosts] Parámetros recibidos:`, { section, categoryName, subcategoryName, searchQuery, page });
    // --- FIN DEBUG 2 ---
    let query = supabase
        .from('posts')
        .select(`
            id, title, slug, excerpt, main_image_url, date,
            show_date, show_author, custom_author_name, download,
            image_description,
            categories:categories ( name, slug, gradient ),
            subcategories:subcategories ( name, slug ),
            sections:sections!inner ( name, slug )
        `, { count: 'exact' }) // ¡Select corregido y completo!
        .eq('status', 'published')
        .order('date', { ascending: false });

    if (all) {
        query = query.range(0, 500);
    }

    // --- Filtros (¡Esta es la parte corregida!) ---
    if (section) {
        // Filtra por el slug de la tabla relacionada 'sections'
        query = query.eq('sections.slug', section);
    }

    if (categoryName) {
        // Filtra por el slug de la tabla relacionada 'categories'
        query = query.eq('categories.slug', categoryName);
    }
    
    if (subcategoryName) {
        // Filtra por el slug de la tabla relacionada 'subcategories'
        query = query.eq('subcategories.slug', subcategoryName); 
    }
    
    if (searchQuery) {
        query = query.ilike('title', `%${searchQuery}%`);
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

export const addPost = async (postData) => {
    const { data, error } = await supabase
        .from('posts')
        .insert([postData])
        .select();

    if (error) {
        console.error('Error adding post:', error);
        throw new Error(error.message);
    }
    
    if (data && data.length > 0 && postData.status === 'published') {
        logActivity(`Usuario creó un nuevo recurso: "${postData.title}"`, { status: postData.status, postId: data[0].id });
        const postUrl = `/blog/${data[0].slug}`;
        await sendSuperadminNotificationEmail(postData.title, postUrl);
    }

    return { data, error: null };
};

export const updatePost = async (postId, postData) => {
    const { data: existingPost, error: fetchError } = await supabase
        .from('posts')
        .select('status')
        .eq('id', postId)
        .single();

    if (fetchError) {
        console.error('Error fetching post for status check:', fetchError);
    }

    const { data, error } = await supabase
        .from('posts')
        .update(postData)
        .eq('id', postId)
        .select();

    if (error) {
        console.error('Error updating post:', error);
        throw new Error(error.message);
    }

    if (existingPost && existingPost.status !== 'published' && postData.status === 'published') {
        logActivity(`Usuario actualizó el recurso: "${postData.title}"`, { postId, changes: Object.keys(postData) });
        const postUrl = `/blog/${data[0].slug}`;
        await sendSuperadminNotificationEmail(postData.title, postUrl);
    } else if (existingPost && existingPost.status === 'published' && postData.status === 'published') {
        logActivity(`Usuario actualizó el recurso: "${postData.title}"`, { postId, changes: Object.keys(postData) });
    }

    return { data, error: null };
};

export const addPostEdit = async (editData) => {
    const { data, error } = await supabase
        .from('post_edits')
        .insert([editData])
        .select();
    
    return { data, error };
};

export const getPendingEdits = async () => {
    const { data, error } = await supabase
        .from('post_edits')
        .select(`*, posts (title, slug), editor_id`)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
    
    if (error) {
        console.error('Error fetching pending edits:', error);
        return [];
    }

    return data || [];
};

export const updatePostEditStatus = async (editId, status, reviewerId) => {
    const { data, error } = await supabase
        .from('post_edits')
        .update({ status, reviewed_at: new Date(), reviewer_id: reviewerId })
        .eq('id', editId)
        .select()
        .single();

    return { data, error };
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

export const deletePost = async (postId, postTitle, shouldLog = true) => {
    const { data: existingPost, error: fetchError } = await supabase
        .from('posts')
        .select('status')
        .eq('id', postId)
        .single();

    if (fetchError) {
        console.error('Error fetching post for status check:', fetchError);
    }

    const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);

    if (!error && shouldLog && existingPost && existingPost.status === 'published') {
        logActivity(`Usuario eliminó el recurso: "${postTitle}"`, { postId });
    }

    return { error };
};

export const incrementPostStat = async (postId, statType) => {
    if (!postId || !statType) return;
    const { error } = await supabase.rpc('increment_post_stat', { 
        post_id_to_update: postId, 
        stat_to_increment: statType 
    });
    if (error) {
        console.error(`Error incrementing ${statType} for post ${postId}:`, error);
    }
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