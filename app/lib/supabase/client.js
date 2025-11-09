import { supabase } from '@/app/lib/customSupabaseClient';
import { logActivity } from '@/app/lib/supabase/log';

/**
 * Increments a specific statistic for a post. This is safe to call from the client-side.
 * @param {string} postId - The ID of the post to update.
 * @param {string} statType - The statistic to increment (e.g., 'visits', 'downloads').
 */
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

export const getPosts = async ({ 
    page = 1, 
    limit = 10, 
    section = null, 
    categoryName = null, 
    subcategoryName = null,
    searchQuery = null, 
    all = false,
    onlyDownloadable = false,
    includeDrafts = false,
    includePending = false
}) => {
    let query = supabase
        .from('posts')
        .select(`
            id, title, slug, excerpt, main_image_url, created_at,
            show_date, show_author, custom_author_name, download,
            image_description,
            categories:categories ( name, gradient ),
            subcategories:subcategories ( name ),
            sections:sections!inner ( name, slug )
        `, { count: 'exact' });

    const statuses = ['published'];
    if (includeDrafts) statuses.push('draft');
    if (includePending) statuses.push('pending_approval');
    
    query = query.in('status', statuses)
                 .order('created_at', { ascending: false });

    if (all) {
        query = query.range(0, 500);
    }

    if (section) {
        query = query.eq('sections.slug', section);
    }

    if (categoryName) {
        query = query.eq('categories.name', categoryName);
    }
    
    if (subcategoryName) {
        query = query.eq('subcategories.name', subcategoryName); 
    }
    
    if (searchQuery) {
        query = query.ilike('title', `%${searchQuery}%`);
    }

    if (onlyDownloadable) {
        query = query.not('download', 'is', null);
    }

    if (!all) {
        const from = (page - 1) * limit;
        const to = page * limit - 1;
        query = query.range(from, to);
    }

    const { data, error, count } = await query;

    if (error) {
        console.error('Error fetching posts:', error.message);
        return { data: [], count: 0, error };
    }

    const formattedData = data.map(post => ({
        ...post,
        date: new Date(post.created_at).toLocaleString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        }),
    }));

    return { data: formattedData, count, error: null };
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

export const addPostEdit = async (editData) => {
    const { data, error } = await supabase
        .from('post_edits')
        .insert([editData])
        .select();
    
    return { data, error };
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
