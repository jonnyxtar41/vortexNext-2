
import React, { Suspense, lazy, useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import Hero from '@/components/Hero';
import { getCategories } from '@/lib/supabase/categories';
import { getFeaturedPosts, getDownloadablePosts } from '@/lib/supabase/posts';
import { getAllSiteContent } from '@/lib/supabase/siteContent';
import LoadingSpinner from '@/components/LoadingSpinner';

const Features = lazy(() => import('@/components/Features'));
const Blog = lazy(() => import('@/components/Blog'));
const RecentPosts = lazy(() => import('@/components/RecentPosts'));
const Downloads = lazy(() => import('@/components/Downloads'));
const AdBlock = lazy(() => import('@/components/AdBlock'));

const LoadingSection = () => (
  <div className="w-full py-20 flex items-center justify-center bg-background/50">
    <LoadingSpinner className="text-primary" />
  </div>
);

const Home = () => {
  const [homeData, setHomeData] = useState({
    categories: [],
    blogPosts: [],
    recentPosts: [],
    downloadablePosts: [],
    siteContent: {},
    loading: true,
  });


  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [categoriesData, featuredPosts, downloadablePostsData, allContent] = await Promise.all([
          getCategories(),
          getFeaturedPosts({ limit: 6 }),
          getDownloadablePosts(6),
          getAllSiteContent(),
        ]);

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

        const shuffledCategories = shuffleArray([...categoriesData]);
        
        const blogPostsData = featuredPosts.filter(p => p.main_image_url).slice(0, 3);
        const recentPostsData = featuredPosts.slice(0, 3);


        setHomeData({
          categories: shuffledCategories.slice(0, 6),
          blogPosts: blogPostsData,
          recentPosts: recentPostsData,
          downloadablePosts: downloadablePostsData,
          siteContent: contentMap,
          loading: false,
        });
      } catch (error) {
        console.error("Error fetching home page data:", error);
        setHomeData(prev => ({ ...prev, loading: false }));
      }
    };

    fetchHomeData();
  }, []);

  return (
    <>
      <Helmet>
        <title>Zona Vortex - Tu universo de conocimiento y curiosidad</title>
        <meta name="description" content="Explora un portal de recursos, artículos y reseñas sobre tecnología, desarrollo personal, aprendizaje de inglés y mucho más." />
        <meta property="og:title" content="Zona Vortex - Tu universo de conocimiento y curiosidad" />
        <meta property="og:description" content="Explora un portal de recursos, artículos y reseñas sobre tecnología, desarrollo personal, aprendizaje de inglés y mucho más." />
      </Helmet>
      
      <Hero heroImageUrl={homeData.siteContent.hero_image_url} />
      <Suspense fallback={<LoadingSection />}>
        <Features categories={homeData.categories} />
      </Suspense>
      <Suspense fallback={<LoadingSection />}>
        <Blog randomPosts={homeData.blogPosts} />
      </Suspense>
      <Suspense fallback={<LoadingSection />}>
        <AdBlock className="container mx-auto" />
      </Suspense>


      <Suspense fallback={<LoadingSection />}>
        <RecentPosts posts={homeData.recentPosts} />
      </Suspense>
      <Suspense fallback={<LoadingSection />}>
        <Downloads posts={homeData.downloadablePosts} />
      </Suspense>
    </>
  );
};

export default Home;
  