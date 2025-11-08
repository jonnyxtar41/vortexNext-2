import React from 'react';
import { getSections } from '@/app/lib/supabase/sections';
import { getAllSiteContent } from '@/app/lib/supabase/siteContent';
import { getCategories } from '@/app/lib/supabase/categories';
import PublicLayoutClient from './PublicLayoutClient';

const PublicLayout = async ({ children }) => {
  // Data fetching on the server
  const sectionsData = await getSections();
  const categoriesData = await getCategories();
  const allContent = await getAllSiteContent();
  const contentMap = allContent.reduce((acc, item) => {
      acc[item.key] = item.value;
      return acc;
  }, {});

  return (
    <PublicLayoutClient 
      sections={sectionsData} 
      siteContent={contentMap}
      allCategories={categoriesData}
    >
      {children}
    </PublicLayoutClient>
  );
};

export default PublicLayout;
