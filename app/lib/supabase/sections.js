import { logActivity } from '@/app/lib/supabase/log';

export const getSections = async (supabase) => {
    const { data, error } = await supabase
        .from('sections')
        .select('*')
        .order('order', { ascending: true });

    if (error) {
        console.error('Error fetching sections:', error);
        return [];
    }
    return data;
};

export const addSection = async (supabase, sectionData) => {
    const { data, error } = await supabase
        .from('sections')
        .insert([sectionData])
        .select();
    
    return { data, error };
};

export const updateSection = async (supabase, sectionId, sectionData) => {
    const { data, error } = await supabase
        .from('sections')
        .update(sectionData)
        .eq('id', sectionId)
        .select();

    return { data, error };
};

export const updateMultipleSections = async (supabase, sections) => {
    const { data, error } = await supabase
        .from('sections')
        .upsert(sections)
        .select();

    return { data, error };
};

export const deleteSection = async (supabase, sectionId, sectionName) => {
    const { error } = await supabase
        .from('sections')
        .delete()
        .eq('id', sectionId);

    return { error };
};

export const getPostCountForSection = async (supabase, sectionId) => {
    const { count, error } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .eq('section_id', sectionId);
    
    if (error) {
        console.error('Error counting posts for section:', error);
        return 0;
    }

    return count;
};

export const getCategoryCountForSection = async (supabase, sectionId) => {
    const { count, error } = await supabase
        .from('categories')
        .select('*', { count: 'exact', head: true })
        .eq('section_id', sectionId);
    
    if (error) {
        console.error('Error counting categories for section:', error);
        return 0;
    }

    return count;
};