export const sendSuperadminNotificationEmail = async (supabase, postTitle, postUrl) => {
    try {

        return { success: true };

    } catch (error) {
        console.error('Failed to send Superadmin notification email:', error);
        return { success: false, error: error.message };
    }
};
