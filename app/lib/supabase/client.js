
/**
 * Increments a specific statistic for a post. This is safe to call from the client-side.
 * @param {object} supabase - The Supabase client instance.
 * @param {string} postId - The ID of the post to update.
 * @param {string} statType - The statistic to increment (e.g., 'visits', 'downloads').
 */
export const incrementPostStat = async (supabase, postId, statType) => {
    if (!postId || !statType) return;
    const { error } = await supabase.rpc('increment_post_stat', { 
        post_id_to_update: postId, 
        stat_to_increment: statType 
    });
    if (error) {
        console.error(`Error incrementing ${statType} for post ${postId}:`, error);
    }
};

export const getPosts = async (supabase, { 
    page = 1, 
    limit = 10, 
    section = null, 
    categoryName = null, 
    subcategoryName = null,
    searchQuery = null, 
    all = false,
    onlyDownloadable = false,
    isPremium = null,
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
    
    if (isPremium !== null) {
        query = query.eq('is_premium', isPremium);
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

export const getPendingEdits = async (supabase) => {
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


export const getPostBySlug = async (supabase, slug) => {
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


export const getRelatedPosts = async (supabase, postId, keywords, limit = 3) => {
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

export const getFeaturedPosts = async (supabase, options = {}) => {
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

export const getDownloadablePosts = async (supabase, count) => {
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

export const getAllSiteContent = async (supabase) => {
    const { data, error } = await supabase
        .from('site_content')
        .select('*');

    if (error) {
        console.error('Error fetching all site content:', error);
        return [];
    }
    return data;
};

export const addPayment = async (supabase, paymentData) => {
    const { data, error } = await supabase
        .from('payments')
        .insert([paymentData])
        .select();
    
    if (error) {
        console.error('Error adding payment:', error);
    }

    return { data, error };
};

export const getAllPostStats = async (supabase) => {
    const { data, error } = await supabase
        .from('post_stats')
        .select('*');
    
    if (error) {
        console.error('Error fetching all post stats:', error);
        return [];
    }

    return data;
};

export const getPayments = async (supabase) => {
    const { data, error } = await supabase
        .from('payments')
        .select('*')
        .order('created_at', { ascending: false });
    if (error) {
        console.error('Error fetching payments:', error);
        return [];
    }
    return data;
};

export const updateSiteContent = async (supabase, key, value) => {
    const { data, error } = await supabase
        .from('site_content')
        .upsert({ key, value }, { onConflict: 'key' })
        .select();

    if (error) {
        console.error(`Error updating site content for key ${key}:`, error);
    }
    return { data, error };
};

