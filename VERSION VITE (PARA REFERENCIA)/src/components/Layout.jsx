import React, { useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SidePanel from '@/components/SidePanel';
import { useLayout } from '@/context/LayoutContext.jsx';
import { cn } from '@/lib/utils';
import { useTheme } from '@/context/ThemeContext';
import { useLocation } from 'react-router-dom';

const Layout = ({ children, sections, siteContent }) => {
  const { isSidePanelOpen, setSidePanelOpen } = useLayout();
  const { theme } = useTheme();
  const location = useLocation();

  useEffect(() => {
    if (window.innerWidth < 1024) {
      setSidePanelOpen(false);
    }
  }, [location.pathname, setSidePanelOpen]);

  return (
    <div className={`theme-${theme}`}>
      <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300">
        <div className="flex flex-1">
          <SidePanel sections={sections} siteContent={siteContent} />
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
    </div>
  );
};

export default Layout;