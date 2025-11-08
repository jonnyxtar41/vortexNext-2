'use client';

import { AuthProvider } from '@/app/contexts/SupabaseAuthContext';
import { ThemeProvider } from 'next-themes';
import ThemeWatcher from '@/app/components/ThemeWatcher';
import { LayoutProvider } from '@/app/context/LayoutContext';
import { AdProvider } from '@/app/context/AdContext';
import { DownloadModalProvider } from '@/app/context/DownloadModalContext';
import { TooltipProvider } from '@/app/components/ui/tooltip';
import { Toaster } from '@/app/components/ui/toaster';

export function Providers({ children }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
    >
      <ThemeWatcher />
      <TooltipProvider>
        <LayoutProvider>
          <AdProvider>
            <DownloadModalProvider>
              <AuthProvider>
                {children}
                <Toaster />
              </AuthProvider>
            </DownloadModalProvider>
          </AdProvider>
        </LayoutProvider>
      </TooltipProvider>
    </ThemeProvider>
  );
}
