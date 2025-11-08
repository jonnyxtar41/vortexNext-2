import fs from 'fs';
import 'dotenv/config';
import { supabase } from '../src/lib/customSupabaseClient.js';

const BASE_URL = 'https://zonavortex.com';

const getAllPublishedPosts = async () => {
    let allPosts = [];
    let page = 0;
    const pageSize = 1000;

    while (true) {
        const { data, error } = await supabase
            .from('posts')
            .select('slug, created_at, sections(slug)')
            .in('status', ['published'])
            .range(page * pageSize, (page + 1) * pageSize - 1);

        if (error) {
            console.error('Error fetching all published posts:', error);
            return [];
        }

        if (data.length === 0) {
            break;
        }

        allPosts = allPosts.concat(data);
        page++;
    }

    return allPosts;
};


const generateSitemap = async () => {
    console.log('Generating sitemap...');

    const posts = await getAllPublishedPosts();

    const sitemap = `
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
        <loc>${BASE_URL}/</loc>
        <lastmod>${new Date().toISOString()}</lastmod>
        <priority>1.00</priority>
    </url>
    <url>
        <loc>${BASE_URL}/recursos</loc>
        <lastmod>${new Date().toISOString()}</lastmod>1
        <priority>0.80</priority>
    </url>
    ${posts.map(post => `
    <url>
        <loc>${BASE_URL}/${post.sections?.slug || 'blog'}/${post.slug}</loc>
        <lastmod>${new Date(post.created_at).toISOString()}</lastmod>
        <priority>0.64</priority>
    </url>
    `).join('')}
</urlset>
    `.trim();

    fs.writeFileSync('public/sitemap.xml', sitemap);

    console.log('Sitemap generated successfully!');
    
    process.exit(0);
};

generateSitemap();
