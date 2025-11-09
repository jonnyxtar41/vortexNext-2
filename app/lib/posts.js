'use server';

import { supabase } from '@/lib/customSupabaseClient';
import { logActivity } from '@/lib/supabase/log';
import { sendSuperadminNotificationEmail } from '@/lib/supabase/email';
import { getSiteContent } from '@/lib/supabase/siteContent';


export const getPosts = async (options = {}) => {
    const {
        section,
        categoryName,
        subcategoryName,
        page = 1,
        limit = 9,
        searchQuery,
        includeDrafts = false,
        includePending = false,
        includeScheduled = false,
        userId
    } = options;

    let query = supabase
        .from('posts')
        .select(`
            id, created_at, title, author, category_id, subcategory_id,
            excerpt, date, image_description, main_image_url, slug,
            show_author, custom_author_name, show_date, status, user_id,
            section_id, is_premium, price, currency, download, published_at,
            is_discount_active, discount_percentage, comments_enabled, custom_fields, is_featured,
            sections!inner(id, name, slug),
            categories!left(id, name, gradient, section_id),
            subcategories (id, name)
        `, { count: 'exact' });

    const statuses = ['published'];
    if (includeDrafts) statuses.push('draft');
    if (includePending) statuses.push('pending_approval');
    if (includeScheduled) statuses.push('scheduled');
    
    if (!includeScheduled) {
        query = query.or(`status.neq.scheduled,and(status.eq.scheduled,published_at.lte.now())`);
    }

    query = query.in('status', statuses);
    
    if (section) query = query.eq('sections.slug', section);
    if (categoryName) query = query.eq('categories.name', categoryName);
    if (subcategoryName) query = query.eq('subcategories.name', subcategoryName);
    if (searchQuery) query = query.or(`title.ilike.%${searchQuery}%,excerpt.ilike.%${searchQuery}%`);
    if (userId) query = query.eq('user_id', userId);

    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    query = query.order('created_at', { ascending: false });

    const { data, error, count } = await query;

    if (error) {
        console.error('Error fetching posts:', error);
        return { data: [], count: 0 };
    }
    
    return { data, count };
};


export const getFeaturedPosts = async (options = {}) => {
    const { limit, withImage } = options;
    let query = supabase
        .from('posts')
        .select('*, categories(name, gradient), sections(slug)')
        .eq('status', 'published')
        .eq('is_featured', true)
        .order('created_at', { ascending: false });

    if (limit) {
        query = query.limit(limit);
    }
    
    if (withImage) {
        query = query.not('main_image_url', 'is', null).neq('main_image_url', '');
    }

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching featured posts:', error);
        return [];
    }

    return data;
}



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
        .or(`status.eq.published,and(status.eq.scheduled,published_at.lte.now()),status.eq.draft,status.eq.pending_approval`)
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
    
    if (!error && data && data.length > 0 && postData.status === 'published') {
        logActivity(`Usuario creó un nuevo recurso: "${postData.title}"`, { status: postData.status, postId: data[0].id });
        const postUrl = `/blog/${data[0].slug}`;
        await sendSuperadminNotificationEmail(postData.title, postUrl);
    } else if(error) {
        console.error('Error adding post:', error);
    }

    return { data, error };
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

    if (!error && existingPost && existingPost.status !== 'published' && postData.status === 'published') {
        logActivity(`Usuario actualizó el recurso: "${postData.title}"`, { postId, changes: Object.keys(postData) });
        const postUrl = `/blog/${data[0].slug}`;
        await sendSuperadminNotificationEmail(postData.title, postUrl);
    } else if (!error && existingPost && existingPost.status === 'published' && postData.status === 'published') {
        logActivity(`Usuario actualizó el recurso: "${postData.title}"`, { postId, changes: Object.keys(postData) });
    }

    return { data, error };
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
        .select(`*, posts (title, slug), editor:editor_id (email)`)
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