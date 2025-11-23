"use server";


import { logActivity } from '@/app/lib/supabase/log';
import { sendSuperadminNotificationEmail } from '@/app/lib/supabase/email';


import sanitizeHtml from 'sanitize-html';
import { createClient } from '@/app/utils/supabase/server';
import { revalidatePath } from 'next/cache';


const sanitizeContent = (html) => {
    if (!html) return null;

    try {
        const clean = sanitizeHtml(html, {
            // Permitimos todas estas etiquetas (igual que tu config anterior)
            allowedTags: [
                'iframe', 'table', 'tbody', 'tr', 'td', 'th', 'thead', 'colgroup', 'col', 
                'div', 'h1', 'h2', 'h3', 'p', 'b', 'i', 'u', 'strong', 'em', 'ul', 'ol', 
                'li', 'a', 'img', 'br', 'blockquote', 'span', 'video', 'source'
            ],
            // Configuración detallada de atributos permitidos
            allowedAttributes: {
                '*': ['style', 'class', 'title', 'data-align', 'data-youtube-video'], // Atributos globales
                'a': ['href', 'target', 'rel', 'name'],
                'img': ['src', 'alt', 'width', 'height', 'loading'],
                'iframe': ['src', 'frameborder', 'allow', 'allowfullscreen', 'width', 'height', 'scrolling'],
                'table': ['border', 'cellpadding', 'cellspacing', 'width', 'height'],
                'td': ['colspan', 'rowspan', 'width', 'align', 'valign'],
                'th': ['colspan', 'rowspan', 'width', 'align', 'valign']
            },
            // Permitimos iframes, pero filtramos por dominio
            allowedIframeHostnames: ['www.youtube.com', 'youtube.com', 'www.youtube-nocookie.com'],
            
            // Esto asegura que los esquemas de URL sean seguros (http, https, mailto)
            allowedSchemes: ['http', 'https', 'mailto', 'tel'],
            allowedSchemesByTag: {
                iframe: ['http', 'https'] 
            },
            
            // Evita que sanitize-html escape caracteres especiales innecesariamente
            parser: {
                decodeEntities: true
            }
        });

        return clean;
    } catch (e) {
        console.error("Error during server-side sanitization (sanitize-html):", e);
        // En caso de error extremo, devolvemos el html original bajo riesgo, o string vacío.
        // Dado que sanitize-html es muy estable, esto raramente ocurre.
        return html; 
    }
};

export const addPost = async (postData) => {
    const supabase = createClient();
    
    const sanitizedPostData = {
        ...postData,
        content: sanitizeContent(postData.content)
    };

    try {
        const { data, error } = await supabase
            .from('posts')
            .insert([sanitizedPostData])
            .select();

        if (error) {
            console.error('--- ERROR EN INSERCIÓN SUPABASE ---', error);
            throw new Error(error.message);
        }
    
        if (data && data.length > 0 && sanitizedPostData.status === 'published') {
            await logActivity(supabase, `Usuario creó un nuevo recurso: "${sanitizedPostData.title}"`, { status: sanitizedPostData.status, postId: data[0].id });
            const postUrl = `/blog/${data[0].slug}`;
            await sendSuperadminNotificationEmail(supabase, sanitizedPostData.title, postUrl);
        }
        console.log('--- FIN DEBUG: ÉXITO EN DB INSERT ---');
        return { data, error: null };
        } catch (e) {
                console.error('--- FIN DEBUG: ERROR GENERAL EN ACTION ---', e);
                throw e;
        }
};

export const updatePost = async (postId, postData) => {
    const supabase = createClient();

    const { data: existingPost, error: fetchError } = await supabase
        .from('posts')
        .select('status')
        .eq('id', postId)
        .single();

    if (fetchError) {
        console.error('Error fetching post for status check:', fetchError);
    }

    const sanitizedPostData = { ...postData };
    if (postData.content) {
        sanitizedPostData.content = sanitizeContent(postData.content);
    }

    const { data, error } = await supabase
        .from('posts')
        .update(sanitizedPostData)
        .eq('id', postId)
        .select();

    if (error) {
        console.error('Error updating post:', error);
        throw new Error(error.message);
    }

    if (existingPost && existingPost.status !== 'published' && sanitizedPostData.status === 'published') {
        await logActivity(supabase, `Usuario actualizó el recurso: "${sanitizedPostData.title}"`, { postId, changes: Object.keys(sanitizedPostData) });
        const postUrl = `/blog/${data[0].slug}`;
        await sendSuperadminNotificationEmail(supabase, sanitizedPostData.title, postUrl);
    } else if (existingPost && existingPost.status === 'published' && sanitizedPostData.status === 'published') {
        await logActivity(supabase, `Usuario actualizó el recurso: "${sanitizedPostData.title}"`, { postId, changes: Object.keys(sanitizedPostData) });
    }
    if (data && data.length > 0) {
        const slug = data[0].slug;
        revalidatePath(`/post/${slug}`); // 👈 Esta línea purga el caché del post
        // También puede revalidar la página de listado (p. ej., /recursos) si es relevante
        // revalidatePath('/recursos'); 
    }
    revalidatePath('/control-panel-7d8a2b3c4f5e/pending-posts');
    revalidatePath('/control-panel-7d8a2b3c4f5e/manage-content');

    return { data, error: null };
};

export const addPostEdit = async (editData) => {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('post_edits')
        .insert([editData])
        .select();
    
    return { data, error };
};

export const getPendingEdits = async () => {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('post_edits')
        .select(`*, posts (title, slug), editor_id`)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
    
    if (error) {
        console.error('Error fetching pending edits:', error);
        return [];
    }

    return data || [];
};

export const updatePostEditStatus = async (editId, status, reviewerId) => {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('post_edits')
        .update({ status, reviewed_at: new Date(), reviewer_id: reviewerId })
        .eq('id', editId)
        .select()
        .single();

    return { data, error };
};



export const incrementPostStat = async (postId, statType) => {
    const supabase = createClient();
    if (!postId || !statType) return;
    const { error } = await supabase.rpc('increment_post_stat', { 
        post_id_to_update: postId, 
        stat_to_increment: statType 
    });
    if (error) {
        console.error(`Error incrementing ${statType} for post ${postId}:`, error);
    }
};


export async function deletePost(postId) {
    const supabase = createClient();
    
    if (!postId) {
        return { error: { message: 'ID de post no válido' } };
    }

    try {
        // (Opcional) Primero, elimina los 'post_edits' huérfanos si tienes RLS que lo impida
        const { error: editError } = await supabase
            .from('post_edits')
            .delete()
            .eq('post_id', postId);

        if (editError) {
             console.warn('Advertencia al eliminar post_edits:', editError.message);
        }

        // Elimina el post principal
        const { error } = await supabase
            .from('posts')
            .delete()
            .eq('id', postId);

        if (error) {
            console.error('Error al eliminar post (Server Action):', error);
            throw new Error(error.message);
        }

        revalidatePath('/control-panel-7d8a2b3c4f5e/pending-posts');
        revalidatePath('/control-panel-7d8a2b3c4f5e/manage-content');
        return { success: true };

    } catch (error) {
        console.error('Error en deletePost Server Action:', error.message);
        return { error: { message: error.message } };
    }
}



