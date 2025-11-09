// app/actions/posts.js
'use server';

import { updatePost } from '@/app/lib/supabase/posts';
import { revalidatePath } from 'next/cache';

/**
 * Server Action to approve a pending edit and publish the changes.
 * This function runs only on the server.
 * @param {object} edit - The pending edit object from the database.
 * @returns {object} - An object indicating success or failure.
 */
export async function approveAndPublishEdit(edit) {
    if (!edit || !edit.post_id || !edit.proposed_data) {
        return { success: false, error: 'Invalid edit data provided.' };
    }

    try {
        const finalData = { ...edit.proposed_data, status: 'published' };
        const { error: postUpdateError } = await updatePost(edit.post_id, finalData);

        if (postUpdateError) {
            throw new Error(postUpdateError.message);
        }

        // Revalidate the path of the post to ensure the cache is cleared and the new content is shown.
        if (edit.posts?.slug) {
            revalidatePath(`/post/${edit.posts.slug}`);
        }
        
        return { success: true, error: null };

    } catch (error) {
        return { success: false, error: error.message };
    }
}

/**
 * Server Action to update a post.
 * This function runs only on the server.
 * @param {string} postId - The ID of the post to update.
 * @param {object} postData - The new data for the post.
 * @returns {object} - An object containing the updated data or an error.
 */
export async function updatePostAction(postId, postData) {
    if (!postId || !postData) {
        return { data: null, error: 'Invalid post ID or data provided.' };
    }

    try {
        const { data, error } = await updatePost(postId, postData);

        if (error) {
            throw new Error(error.message);
        }

        // Revalidate the path of the post to ensure the cache is cleared.
        if (data && data[0] && data[0].slug) {
            revalidatePath(`/post/${data[0].slug}`);
        }
        
        return { data, error: null };

    } catch (error) {
        return { data: null, error: error.message };
    }
}
