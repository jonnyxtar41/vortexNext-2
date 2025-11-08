'use client';

import { useEffect } from 'react';
import { useTheme } from 'next-themes';
import { applyTheme, predefinedThemes, getThemeConfig } from '@/app/lib/themes';

const ThemeWatcher = () => {
  const { theme, resolvedTheme } = useTheme();

  useEffect(() => {
    // On initial mount, apply the saved theme from localStorage
    const initialTheme = getThemeConfig();
    applyTheme(initialTheme);
  }, []);

  useEffect(() => {
    const currentTheme = theme === 'system' ? resolvedTheme : theme;
    const themeObject = predefinedThemes.find(t => t.name === currentTheme) 
                       || getThemeConfig(); // Fallback to saved/default
    
    if (themeObject) {
      applyTheme(themeObject);
    }
  }, [theme, resolvedTheme]);

  return null; // This component doesn't render anything
};

export default ThemeWatcher;
