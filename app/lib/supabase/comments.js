export const getCommentsByPostId = async (supabase, postId) => {
    if (!postId) return [];

    const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('post_id', postId)
        .eq('status', 'approved')
        .is('parent_id', null)
        .order('created_at', { ascending: true });

    if (error) {
        console.error('Error fetching comments:', error);
        return [];
    }

    const commentIds = data.map(comment => comment.id);
    const { data: replies, error: repliesError } = await supabase
        .from('comments')
        .select('*')
        .in('parent_id', commentIds)
        .eq('status', 'approved')
        .order('created_at', { ascending: true });
        
    if (repliesError) {
        console.error('Error fetching replies:', repliesError);
    } else {
        const repliesByParent = replies.reduce((acc, reply) => {
            if (!acc[reply.parent_id]) {
                acc[reply.parent_id] = [];
            }
            acc[reply.parent_id].push(reply);
            return acc;
        }, {});
        
        data.forEach(comment => {
            comment.replies = repliesByParent[comment.id] || [];
        });
    }

    return data;
};

export const addComment = async (supabase, commentData) => {
    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase
        .from('comments')
        .insert([{ ...commentData, user_id: user?.id }])
        .select()
        .single();
    
    if (error) {
        console.error('Error adding comment:', error);
    }
    
    return { data, error };
};