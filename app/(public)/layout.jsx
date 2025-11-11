import React from 'react';
import { getSections } from '@/app/lib/supabase/sections';
import { getAllSiteContent } from '@/app/lib/supabase/client';
import { getCategories } from '@/app/lib/supabase/categories';
import PublicLayoutClient from './PublicLayoutClient';
import { createClient } from '@/app/utils/supabase/server';

const PublicLayout = async ({ children }) => {
  const supabase = createClient();
  // Data fetching on the server
  const sectionsData = await getSections(supabase);
  const categoriesData = await getCategories(supabase);
  const allContent = await getAllSiteContent(supabase);
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
