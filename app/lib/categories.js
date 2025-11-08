import { supabase } from '@/lib/customSupabaseClient';

export const getCategories = async () => {
    const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true });

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

    return { data, error };
};

export const updateCategory = async (categoryId, categoryData) => {
    const { data, error } = await supabase
        .from('categories')
        .update(categoryData)
        .eq('id', categoryId)
        .select();

    return { data, error };
};

export const deleteCategory = async (categoryId) => {
    const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId);

    return { error };
};