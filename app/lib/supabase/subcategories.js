import { supabase } from '@/lib/customSupabaseClient';
import { logActivity } from '@/lib/supabase/log';

export const getSubcategories = async (options = {}) => {
    const { categoryId } = options;
    let query = supabase.from('subcategories').select('*, categories(name)');

    if (categoryId) {
        query = query.eq('category_id', categoryId);
    }
    
    query = query.order('name', { ascending: true });

    const { data, error } = await query;
    if (error) {
        console.error("Error fetching subcategories:", error);
        return [];
    }
    return data;
};

export const addSubcategory = async (subcategoryData) => {
    const { data, error } = await supabase
        .from('subcategories')
        .insert([subcategoryData])
        .select();

    if (!error) {
        logActivity(`Admin creó una nueva subcategoría: "${subcategoryData.name}"`);
    }
    return { data, error };
};

export const updateSubcategory = async (id, updates) => {
    const { data, error } = await supabase
        .from('subcategories')
        .update(updates)
        .eq('id', id)
        .select();

    if (!error) {
        logActivity(`Admin actualizó la subcategoría: "${updates.name}"`, { subcategoryId: id });
    }
    return { data, error };
};

export const deleteSubcategory = async (id, name) => {
    const { error } = await supabase
        .from('subcategories')
        .delete()
        .eq('id', id);

    return { error };
};

export const getPostCountForSubcategory = async (subcategoryId) => {
    const { count, error } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .eq('subcategory_id', subcategoryId);

    if (error) {
        console.error("Error counting posts for subcategory:", error);
        return 0;
    }
    return count;
};

export const reassignPostsSubcategory = async (oldSubcategoryId, newSubcategoryId) => {
    const { data, error } = await supabase
        .from('posts')
        .update({ subcategory_id: newSubcategoryId })
        .eq('subcategory_id', oldSubcategoryId);
    
    if (error) {
        console.error("Error reassigning posts' subcategory:", error);
    }
    return { data, error };
};