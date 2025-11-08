import React, { createContext, useState, useContext, useEffect } from 'react';
import { getThemeConfig, applyTheme, saveThemeConfig, predefinedThemes } from '@/lib/themes';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(predefinedThemes.find(t => t.name === 'cosmic-latte') || predefinedThemes[0]);
    
    useEffect(() => {
        const savedTheme = getThemeConfig();
        setTheme(savedTheme);
        applyTheme(savedTheme);
    }, []);

    const changeTheme = (newTheme) => {
        setTheme(newTheme);
        saveThemeConfig(newTheme);
        applyTheme(newTheme);
    };

    return (
        <ThemeContext.Provider value={{ theme, changeTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};