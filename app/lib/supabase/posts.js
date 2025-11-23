
export const getRandomPosts = async (supabase, count) => {
  const { data: posts, error } = await supabase
    .from('posts')
    .select('*, categories(name, gradient)')
    .eq('status', 'published');

  if (error) {
    console.error('Error fetching random posts:', error);
    return [];
  }

  const shuffled = posts.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

export const getRandomPostsWithImages = async (supabase, count) => {
  const { data: posts, error } = await supabase
    .from('posts')
      .select('*, categories(name, gradient), sections(slug)')
    .eq('status', 'published')
    .not('main_image_url', 'is', null)
    .neq('main_image_url', '');

  if (error) {
    console.error('Error fetching random posts with images:', error);
    return [];
  }

  const shuffled = posts.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};



export const getPostImageUrls = async (supabase) => {
    const { data, error } = await supabase
        .from('posts')
        .select('main_image_url')
        .not('main_image_url', 'is', null)
        .neq('main_image_url', '');

    if (error) {
        console.error('Error fetching post image URLs:', error);
        return [];
    }

    return data?.map(post => post.main_image_url) || [];
};


export const getPopularPostsSlugs = async (supabase, limit = 100) => {
    const { data, error } = await supabase
        .from('posts')
        .select('slug')
        .eq('status', 'published')
        
        .order('created_at', { ascending: false }) // Obtiene los más recientes para pre-renderizar
        .limit(limit);

    if (error) {
        console.error('Error fetching post slugs for static generation:', error);
        return [];
    }

    return data || [];
};




// app/lib/supabase/posts.js (

export const getPublishedPostsSlugs = async (supabase) => {
    // Nota: El cliente de Supabase se pasa desde el lado del servidor
    const { data, error } = await supabase
        .from('posts')
        // Seleccionamos el slug del post, la sección y la fecha para la URL y lastModified
        .select('slug, sections(slug), created_at') 
        .eq('status', 'published')
        .order('created_at', { ascending: false });
        
    if (error) {
        console.error('Error fetching slugs for sitemap:', error);
        return [];
    }

    // Devuelve un array de objetos con slug, section.slug y created_at
    return data || []; 
};