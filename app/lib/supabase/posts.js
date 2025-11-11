
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