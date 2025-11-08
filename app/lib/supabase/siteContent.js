import { supabase } from '@/app/lib/customSupabaseClient';
import { logActivity } from './log';

export const getSiteContent = async (key) => {
    const { data, error } = await supabase
        .from('site_content')
        .select('value')
        .eq('key', key)
        .single();

    if (error && error.code !== 'PGRST116') { // Ignore "No rows found"
        console.error(`Error fetching site content for key ${key}:`, error);
        return null;
    }
    return data?.value;
};

export const getAllSiteContent = async () => {
    const { data, error } = await supabase
        .from('site_content')
        .select('*');

    if (error) {
        console.error('Error fetching all site content:', error);
        return [];
    }
    return data;
};

export const updateSiteContent = async (key, value) => {
    const { data, error } = await supabase
        .from('site_content')
        .upsert({ key, value }, { onConflict: 'key' })
        .select();

    if (error) {
        console.error(`Error updating site content for key ${key}:`, error);
    }
    return { data, error };
};

export const getPayments = async () => {
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

export const addPayment = async (paymentData) => {
    const { data, error } = await supabase
        .from('payments')
        .insert([paymentData])
        .select();
    
    if (error) {
        console.error('Error adding payment:', error);
    }

    return { data, error };
};