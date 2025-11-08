import { supabase } from '@/app/lib/customSupabaseClient';
import { logActivity } from '@/app/lib/supabase/log';

// This comment is added to force a re-transpilation/re-evaluation of this module.

export const getCategories = async (options = {}) => {
    const { sectionId } = options;
    
    let query = supabase
        .from('categories')
        .select('*, sections(name, slug)')
        .order('name', { ascending: true });

    if (sectionId) {
        query = query.eq('section_id', sectionId);
    }

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching categories:', error);
        return [];
    }
    return data;
};

export const addCategory = async (categoryData) => {
    const { data, error } = await supabase
        .from('categories')
        .insert([categoryData])
        .select();
    
    if (!error) {
        logActivity(`Admin creó una nueva categoría: "${categoryData.name}"`);
    }

    return { data, error };
};

export const updateCategory = async (categoryId, categoryData) => {
    const { data, error } = await supabase
        .from('categories')
        .update(categoryData)
        .eq('id', categoryId)
        .select();

    if (!error) {
        logActivity(`Admin actualizó la categoría: "${categoryData.name}"`, { categoryId });
    }

    return { data, error };
};

export const deleteCategory = async (categoryId, categoryName) => {
    const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId);

    return { error };
};

export const getPostCountForCategory = async (categoryId) => {
    const { count, error } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .eq('category_id', categoryId);
    
    if (error) {
        console.error('Error counting posts for category:', error);
        return 0;
    }

    return count;
};

export const reassignPostsCategory = async (oldCategoryId, newCategoryId) => {
    const { data, error } = await supabase
        .from('posts')
        .update({ category_id: newCategoryId })
        .eq('category_id', oldCategoryId);

    if (error) {
        console.error('Error reassigning posts:', error);
    }
    
    return { data, error };
};