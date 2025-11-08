'use client';

import { AuthProvider } from '@/contexts/SupabaseAuthContext';
import { ThemeProvider } from 'next-themes';
import ThemeWatcher from '@/components/ThemeWatcher';
import { LayoutProvider } from '@/context/LayoutContext';
import { AdProvider } from '@/context/AdContext';
import { DownloadModalProvider } from '@/context/DownloadModalContext';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/toaster';

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
