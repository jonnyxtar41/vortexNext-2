import dynamic from 'next/dynamic';
import Hero from '@/app/components/Hero';
import { getCategories } from '@/app/lib/supabase/categories';
import { getFeaturedPosts, getDownloadablePosts } from '@/app/lib/supabase/posts';
import { getAllSiteContent } from '@/app/lib/supabase/siteContent';
import LoadingSpinner from '@/app/components/LoadingSpinner';

const LoadingSection = () => (
  <div className="w-full py-20 flex items-center justify-center bg-background/50">
    <LoadingSpinner className="text-primary" />
  </div>
);

const Features = dynamic(() => import('@/app/components/Features'), { loading: () => <LoadingSection /> });
const Blog = dynamic(() => import('@/app/components/Blog'), { loading: () => <LoadingSection /> });
const RecentPosts = dynamic(() => import('@/app/components/RecentPosts'), { loading: () => <LoadingSection /> });
const Downloads = dynamic(() => import('@/app/components/Downloads'), { loading: () => <LoadingSection /> });
const AdBlock = dynamic(() => import('@/app/components/AdBlock'), { loading: () => <LoadingSection /> });

const Home = async () => {
  const [categoriesData, featuredPosts, downloadablePostsData, allContent] = await Promise.all([
    getCategories(),
    getFeaturedPosts({ limit: 6 }),
    getDownloadablePosts(6),
    getAllSiteContent(),
  ]);

  // Sanitize data to make it serializable for client components
  const serializableCategories = JSON.parse(JSON.stringify(categoriesData));
  const serializableFeatured = JSON.parse(JSON.stringify(featuredPosts));
  const serializableDownloads = JSON.parse(JSON.stringify(downloadablePostsData));

  const contentMap = allContent.reduce((acc, item) => {
      acc[item.key] = item.value;
      return acc;
  }, {});

  const shuffleArray = (array) => {
    let currentIndex = array.length, randomIndex;
    while (currentIndex !== 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
      [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;
  };

  const shuffledCategories = shuffleArray([...serializableCategories]);
  
  const blogPostsData = serializableFeatured.filter(p => p.main_image_url).slice(0, 3);
  const recentPostsData = serializableFeatured.slice(0, 3);

  const homeData = {
    categories: shuffledCategories.slice(0, 6),
    blogPosts: blogPostsData,
    recentPosts: recentPostsData,
    downloadablePosts: serializableDownloads,
    siteContent: contentMap,
  };

  return (
    <>
      <Hero heroImageUrl={homeData.siteContent.hero_image_url} />
      <Features categories={homeData.categories} />
      <Blog randomPosts={homeData.blogPosts} />
      <AdBlock className="container mx-auto" />
      <RecentPosts posts={homeData.recentPosts} />
      <Downloads posts={homeData.downloadablePosts} />
    </>
  );
};

export default Home;
