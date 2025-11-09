// app/actions/posts.js
'use server';

import { updatePost } from '@/app/lib/supabase/posts';
import { revalidatePath } from 'next/cache';

// Asumo que tienes una forma de crear un cliente de servidor,
// esta es la forma estándar de Supabase con Next.js:
import { createClient } from '@/app/utils/supabase/server'; 
import { logActivity } from '@/app/lib/supabase/log'; // Asumiendo que logActivity puede correr en servidor

/**
 * Server Action to approve a pending edit and publish the changes.
 * This function runs only on the server.
 * @param {object} edit - The pending edit object from the database.
 * @returns {object} - An object indicating success or failure.
 */
export async function approveAndPublishEdit(edit) {
    // ... (Tu función existente está bien)
}

/**
 * Server Action to update a post.
 * This function runs only on the server.
 * @param {string} postId - The ID of the post to update.
 * @param {object} postData - The new data for the post.
 * @returns {object} - An object containing the updated data or an error.
 */
export async function updatePostAction(postId, postData) {
    // ... (Tu función existente está bien)
}


// --- ¡NUEVAS ACCIONES DE SERVIDOR SEGURAS! ---

/**
 * ! NUEVA ACCIÓN DE SERVIDOR
 * Server Action to add a post edit.
 * This function runs only on the server.
 * @param {object} editData - The data for the new edit.
 */
export async function addPostEditAction(editData) {
    const supabase = createClient();

    // 1. ¡VERIFICACIÓN DE SEGURIDAD!
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: 'Usuario no autenticado.' };
    }

    // 2. Insertar datos con el ID del usuario verificado
    const dataToInsert = { ...editData, editor_id: user.id };
    
    const { data, error } = await supabase
        .from('post_edits')
        .insert([dataToInsert])
        .select();

    if (error) {
        return { success: false, error: error.message };
    }

    return { success: true, data };
}

/**
 * ! NUEVA ACCIÓN DE SERVIDOR
 * Server Action to update the status of a post edit (approve/reject).
 * This function runs only on the server.
 * @param {string} editId - The ID of the edit.
 * @param {string} status - The new status ('approved' or 'rejected').
 */
export async function updatePostEditStatusAction(editId, status) {
    const supabase = createClient();
    // 1. ¡VERIFICACIÓN DE SEGURIDAD!
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: 'Usuario no autenticado.' };
    }

    // !! IMPORTANTE: Añade comprobación de rol (ej. admin)
    // const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    // if (profile.role !== 'admin' && profile.role !== 'editor') {
    //     return { success: false, error: 'No tienes permisos para esta acción.' };
    // }

    // 2. Realizar la actualización
    const { data, error } = await supabase
        .from('post_edits')
        .update({ status, reviewed_at: new Date(), reviewer_id: user.id }) // Usar el ID del revisor autenticado
        .eq('id', editId)
        .select()
        .single();

    if (error) {
        return { success: false, error: error.message };
    }
    
    return { success: true, data };
}

/**
 * ! NUEVA ACCIÓN DE SERVIDOR
 * Server Action to delete a post.
 * This function runs only on the server.
 * @param {string} postId - The ID of the post to delete.
 * @param {string} postTitle - The title (for logging).
 */
export async function deletePostAction(postId, postTitle) {
    const supabase = createClient();

    // 1. ¡VERIFICACIÓN DE SEGURIDAD!
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: 'Usuario no autenticado.' };
    }

    // !! IMPORTANTE: Añade comprobación de rol (ej. admin)
    // const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    // if (profile.role !== 'admin') {
    //     return { success: false, error: 'No tienes permisos para esta acción.' };
    // }

    // 2. Obtener slug para revalidación (antes de borrar)
    const { data: existingPost } = await supabase
        .from('posts')
        .select('status, slug')
        .eq('id', postId)
        .single();

    // 3. Realizar la eliminación
    const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);

    if (error) {
        return { success: false, error: error.message };
    }

  // 4. Log y Revalidación
    if (existingPost && existingPost.status === 'published') {
        await logActivity(`Usuario eliminó el recurso: "${postTitle}"`, { postId, userId: user.id });
    }

    revalidatePath('/');
    if (existingPost?.slug) {
        revalidatePath(`/post/${existingPost.slug}`);
    }

    return { success: true };
}