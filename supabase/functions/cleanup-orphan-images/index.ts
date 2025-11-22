import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.5';

Deno.serve(async (req) => {
    try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

        if (!supabaseUrl || !supabaseServiceRoleKey) {
            throw new Error('Supabase URL or Service Role Key not set in environment variables.');
        }

        const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
            auth: {
                persistSession: false,
                autoRefreshToken: false,
                detectSessionInUrl: false,
            },
        });

       

        // 1. Fetch all main_image_url values from the posts table
        const { data: posts, error: postsError } = await supabase
            .from('posts')
            .select('main_image_url');

        if (postsError) {
            console.error('Error fetching posts:', postsError);
            return new Response(JSON.stringify({ error: 'Failed to fetch posts' }), {
                headers: { 'Content-Type': 'application/json' },
                status: 500,
            });
        }

        const referencedImageUrls = new Set(
            posts
                .map((post) => post.main_image_url)
                .filter(Boolean) // Filter out null or empty URLs
        );
        

        // 2. List all files in the 'site-assets' bucket
        const { data: files, error: filesError } = await supabase.storage
            .from('site-assets')
            .list();

        if (filesError) {
            console.error('Error listing files in site-assets bucket:', filesError);
            return new Response(JSON.stringify({ error: 'Failed to list storage files' }), {
                headers: { 'Content-Type': 'application/json' },
                status: 500,
            });
        }

        const orphanFilesToDelete: string[] = [];
        for (const file of files) {
            // Construct the full public URL for comparison
            const publicUrl = `${supabaseUrl}/storage/v1/object/public/site-assets/${file.name}`;
            if (!referencedImageUrls.has(publicUrl)) {
                orphanFilesToDelete.push(file.name);
            }
        }

        

        // 3. Delete orphan images
        if (orphanFilesToDelete.length > 0) {
            const { error: deleteError } = await supabase.storage
                .from('site-assets')
                .remove(orphanFilesToDelete);

            if (deleteError) {
                console.error('Error deleting orphan files:', deleteError);
                return new Response(JSON.stringify({ error: 'Failed to delete orphan files' }), {
                    headers: { 'Content-Type': 'application/json' },
                    status: 500,
                });
            }
            
        } else {
            console.log('No orphan files found. Nothing to delete.');
        }

        return new Response(JSON.stringify({
            message: 'Orphan image cleanup completed.',
            deletedCount: orphanFilesToDelete.length,
        }), {
            headers: { 'Content-Type': 'application/json' },
            status: 200,
        });

    } catch (error) {
        console.error('Unhandled error during cleanup:', error);
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { 'Content-Type': 'application/json' },
            status: 500,
        });
    }
});
