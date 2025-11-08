
import { supabase } from '@/lib/customSupabaseClient';

export const getTemplates = async () => {
    const { data, error } = await supabase
        .from('post_templates')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching templates:', error);
        return [];
    }
    return data;
};

export const saveTemplate = async (name, content) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: { message: 'User not authenticated' } };

    const { data, error } = await supabase
        .from('post_templates')
        .insert([{ name, content, user_id: user.id }])
        .select();

    return { data, error };
};

export const deleteTemplate = async (templateId) => {
    const { data, error } = await supabase
        .from('post_templates')
        .delete()
        .eq('id', templateId);

    return { data, error };
};
  