export const logActivity = async (supabase, action, details = null) => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        
        const logEntry = {
            user_id: user?.id || null,
            user_email: user?.email || 'Anónimo/Sistema',
            action,
            details,
        };

        const { error } = await supabase.from('activity_log').insert(logEntry);

        if (error) {
            console.error('Error logging activity:', error);
        }
    } catch (e) {
        console.error('Failed to get user for activity log:', e);
    }
};