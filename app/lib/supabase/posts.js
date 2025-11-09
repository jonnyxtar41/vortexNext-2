import { supabase } from '@/app/lib/customSupabaseClient';
import { logActivity } from '@/app/lib/supabase/log';
import { sendSuperadminNotificationEmail } from '@/app/lib/supabase/email';
import createDOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

// --- Server-side HTML Sanitization ---
const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

const sanitizeContent = (html) => {
    if (!html) return null;

    // Configuration is strict by default. We add what's needed.
    const sanitized = DOMPurify.sanitize(html, {
        ADD_TAGS: [
            'iframe', 'table', 'tbody', 'tr', 'td', 'th', 'thead', 'colgroup', 'col', 'div',
            'h1', 'h2', 'h3', 'p', 'b', 'i', 'u', 'strong', 'em', 'ul', 'ol', 'li', 'a', 'img', 'br', 'blockquote', 'span'
        ],
        ADD_ATTR: [
            'style', 'class', 'colspan', 'rowspan', 'src', 'frameborder', 
            'allow', 'allowfullscreen', 'width', 'height', 'loading', 'title',
            'data-align', 'data-youtube-video', 'href', 'alt', 'target', 'rel'
        ],
        // IMPORTANT: Allow iframes only from trusted sources
        FORBID_TAGS: [],
        FORBID_ATTR: [],
        // Add a hook to verify iframe sources
        ADD_HOOKS: {
            afterSanitizeAttributes: (node) => {
                // Check for iframes
                if (node.tagName.toLowerCase() === 'iframe') {
                    const src = node.getAttribute('src');
                    if (src) {
                        try {
                            const url = new URL(src);
                            // Allow only YouTube embeds
                            if (url.hostname !== 'www.youtube.com' && url.hostname !== 'youtube.com' && url.hostname !== 'www.youtube-nocookie.com') {
                                node.removeAttribute('src');
                            }
                        } catch (e) {
                            // Invalid URL, remove src
                            node.removeAttribute('src');
                        }
                    }
                }
            }
        }
    });
    return sanitized;
};

export const addPost = async (postData) => {
    // Sanitize content before inserting
    const sanitizedPostData = {
        ...postData,
        content: sanitizeContent(postData.content)
    };

    const { data, error } = await supabase
        .from('posts')
        .insert([sanitizedPostData])
        .select();

    if (error) {
        console.error('Error adding post:', error);
        throw new Error(error.message);
    }
    
    if (data && data.length > 0 && sanitizedPostData.status === 'published') {
        logActivity(`Usuario creó un nuevo recurso: "${sanitizedPostData.title}"`, { status: sanitizedPostData.status, postId: data[0].id });
        const postUrl = `/blog/${data[0].slug}`;
        await sendSuperadminNotificationEmail(sanitizedPostData.title, postUrl);
    }

    return { data, error: null };
};

export const updatePost = async (postId, postData) => {
    const { data: existingPost, error: fetchError } = await supabase
        .from('posts')
        .select('status')
        .eq('id', postId)
        .single();

    if (fetchError) {
        console.error('Error fetching post for status check:', fetchError);
    }

    // Sanitize content before updating, if it exists
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
        logActivity(`Usuario actualizó el recurso: "${sanitizedPostData.title}"`, { postId, changes: Object.keys(sanitizedPostData) });
        const postUrl = `/blog/${data[0].slug}`;
        await sendSuperadminNotificationEmail(sanitizedPostData.title, postUrl);
    } else if (existingPost && existingPost.status === 'published' && sanitizedPostData.status === 'published') {
        logActivity(`Usuario actualizó el recurso: "${sanitizedPostData.title}"`, { postId, changes: Object.keys(sanitizedPostData) });
    }

    return { data, error: null };
};