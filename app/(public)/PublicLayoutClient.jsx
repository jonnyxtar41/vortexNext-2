'use client';

import React, { useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SidePanel from '@/components/SidePanel';
import { useLayout } from '@/context/LayoutContext.jsx';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';
import PushNotificationManager from '@/components/PushNotificationManager';
import CookieConsent from '@/components/CookieConsent';
import InterstitialAd from '@/components/InterstitialAd';
import DownloadModal from '@/components/DownloadModal';

const PublicLayoutClient = ({ children, sections, siteContent, allCategories }) => {
  const { isSidePanelOpen, setSidePanelOpen } = useLayout();
  const pathname = usePathname();

  useEffect(() => {
    if (window.innerWidth < 1024) {
      setSidePanelOpen(false);
    }
  }, [pathname, setSidePanelOpen]);

  return (
    <>
      <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300">
        <div className="flex flex-1">
          <SidePanel sections={sections} siteContent={siteContent} allCategories={allCategories} />
          <div className={cn(
            "flex flex-col flex-1 transition-all duration-300",
            isSidePanelOpen && window.innerWidth >= 1024 ? "lg:ml-72" : ""
          )}>
            <Header sections={sections} siteContent={siteContent} />
            <div className="flex-grow">{children}</div>
            <Footer siteContent={siteContent} />
          </div>
        </div>
      </div>
      <PushNotificationManager frequencyDays={siteContent.notification_prompt_frequency_days} />
      <CookieConsent />
      <InterstitialAd />
      <DownloadModal />
    </>
  );
};

export default PublicLayoutClient;
