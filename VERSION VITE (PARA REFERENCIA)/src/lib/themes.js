export const THEME_CONFIG_KEY = 'zona-vortex-theme-config';

export const predefinedThemes = [
    {
        name: 'default',
        label: 'Vortex Púrpura (Defecto)',
        isPredefined: true,
        colors: {
            '--background': '265 60% 8%',
            '--foreground': '255 5% 95%',
            '--editor-background': '265 40% 15%',
            '--primary': '240 100% 67%',
            '--primary-foreground': '255 100% 98%',
            '--secondary': '280 50% 20%',
            '--accent': '310 100% 60%',
            '--border': '265 30% 25%',
            '--input': '265 40% 15%',
            '--ring': '240 100% 75%',
            '--input-background': '265 40% 15%',
            '--input-foreground': '255 5% 95%',
            '--text-muted': '255 5% 80%',
            '--text-subtle': '255 5% 60%',
            '--link': '240 100% 75%',
            '--link-hover': '240 100% 85%',
            '--special': '50 100% 60%',
            '--muted-foreground': '215 20.2% 65.1%',
            '--card-muted-foreground': '215 20.2% 65.1%',
            '--hero-muted-foreground': '215 20.2% 65.1%',
        }
    },
    {
        name: 'ocean-deep',
        label: 'Océano Profundo',
        isPredefined: true,
        colors: {
            '--background': '210 50% 10%',
            '--foreground': '210 30% 90%',
            '--editor-background': '210 40% 15%',
            '--editor-background': '210 40% 15%', 
            '--primary': '185 100% 50%', // Cyan
            '--primary-foreground': '210 50% 10%',
            '--secondary': '200 40% 25%',
            '--accent': '220 100% 65%', // Bright Blue
            '--border': '210 30% 20%',
            '--input': '210 40% 15%',
            '--ring': '185 100% 60%',
            '--input-background': '265 40% 15%',
            '--input-foreground': '255 5% 95%',
            '--text-muted': '210 30% 80%',
            '--text-subtle': '210 30% 60%',
            '--link': '185 100% 60%',
            '--link-hover': '185 100% 70%',
            '--special': '220 100% 70%',
            '--muted-foreground': '210 30% 70%',
            '--card-muted-foreground': '210 30% 70%',
            '--hero-muted-foreground': '210 30% 70%',
        }
    },
    {
        name: 'sunset-glow',
        label: 'Brillo del Atardecer',
        isPredefined: true,
        colors: {
            '--background': '25 30% 8%',
            '--foreground': '30 20% 95%',
            '--editor-background': '210 40% 15%',
            '--primary': '35 100% 60%', // Orange
            '--primary-foreground': '25 30% 8%',
            '--secondary': '15 50% 30%',
            '--accent': '0 100% 70%',   // Red
            '--border': '25 20% 20%',
            '--input': '25 25% 15%',
            '--ring': '35 100% 70%',
            '--input-background': '265 40% 15%',
            '--input-foreground': '255 5% 95%',
            '--text-muted': '30 20% 85%',
            '--text-subtle': '30 20% 65%',
            '--link': '35 100% 70%',
            '--link-hover': '35 100% 80%',
            '--special': '0 100% 75%',
            '--muted-foreground': '30 20% 75%',
            '--card-muted-foreground': '30 20% 75%',
            '--hero-muted-foreground': '30 20% 75%',
        }
    },
    {
        name: 'forest-whisper',
        label: 'Susurro del Bosque',
        isPredefined: true,
        colors: {
            '--background': '120 20% 8%',
            '--foreground': '100 10% 92%',
            '--editor-background': '210 40% 15%',
            '--primary': '140 80% 45%', // Green
            '--primary-foreground': '120 20% 8%',
            '--secondary': '130 30% 25%',
            '--accent': '80 90% 55%',  // Lime
            '--border': '120 15% 20%',
            '--input': '120 18% 15%',
            '--ring': '140 80% 55%',
            '--input-background': '265 40% 15%',
            '--input-foreground': '255 5% 95%',
            '--text-muted': '100 10% 82%',
            '--text-subtle': '100 10% 62%',
            '--link': '140 80% 55%',
            '--link-hover': '140 80% 65%',
            '--special': '80 90% 60%',
            '--muted-foreground': '100 10% 72%',
            '--card-muted-foreground': '100 10% 72%',
            '--hero-muted-foreground': '100 10% 72%',
        }
    },
    {
        name: 'nebula-dream',
        label: 'Sueño de Nebulosa',
        isPredefined: true,
        colors: {
            '--background': '280 30% 10%',
            '--foreground': '290 20% 94%',
            '--editor-background': '210 40% 15%',
            '--primary': '270 100% 75%', // Purple
            '--primary-foreground': '280 30% 10%',
            '--secondary': '320 60% 35%',
            '--accent': '200 100% 60%', // Light Blue
            '--border': '280 25% 22%',
            '--input': '280 28% 18%',
            '--ring': '270 100% 85%',
            '--input-background': '265 40% 15%',
            '--input-foreground': '255 5% 95%',
            '--text-muted': '290 20% 84%',
            '--text-subtle': '290 20% 64%',
            '--link': '270 100% 80%',
            '--link-hover': '270 100% 90%',
            '--special': '200 100% 65%',
            '--muted-foreground': '290 20% 74%',
            '--card-muted-foreground': '290 20% 74%',
            '--hero-muted-foreground': '290 20% 74%',
        }
    },
    {
        name: 'monochrome-matrix',
        label: 'Matriz Monocromática',
        isPredefined: true,
        colors: {
            '--background': '0 0% 8%',
            '--foreground': '0 0% 95%',
            '--editor-background': '210 40% 15%',
            '--primary': '0 0% 100%', // White
            '--primary-foreground': '0 0% 8%',
            '--secondary': '0 0% 25%',
            '--accent': '0 0% 60%', // Gray
            '--border': '0 0% 20%',
            '--input': '0 0% 15%',
            '--ring': '0 0% 80%',
            '--input-background': '265 40% 15%',
            '--input-foreground': '255 5% 95%',
            '--text-muted': '0 0% 80%',
            '--text-subtle': '0 0% 60%',
            '--link': '0 0% 85%',
            '--link-hover': '0 0% 95%',
            '--special': '0 0% 70%',
            '--muted-foreground': '0 0% 65%',
            '--card-muted-foreground': '0 0% 65%',
            '--hero-muted-foreground': '0 0% 65%',
        }
    },
    {
        name: 'cosmic-latte',
        label: 'Cosmic Latte (Claro)',
        isPredefined: true,
        colors: {
            '--background': '35 50% 95%', // Creamy white
            '--foreground': '30 20% 15%', // Dark brown/black
            '--editor-background': '35 20% 85%',
            '--primary': '25 80% 55%', // Warm Orange
            '--primary-foreground': '35 50% 95%',
            '--secondary': '35 30% 88%', // Light beige
            '--accent': '205 50% 50%', // Dusty blue
            '--border': '35 20% 80%',
            '--input': '35 20% 85%',
            '--ring': '25 80% 65%',
            '--input-background': '35 20% 85%',
            '--input-foreground': '30 20% 15%',
            '--text-muted': '30 20% 35%',
            '--text-subtle': '30 20% 55%',
            '--link': '205 50% 55%',
            '--link-hover': '205 50% 65%',
            '--special': '25 80% 60%',
            '--muted-foreground': '30 20% 45%',
            '--card-muted-foreground': '30 20% 45%',
            '--hero-muted-foreground': '30 20% 35%',
        }
    },
    {
        name: 'midnight-cyber',
        label: 'Midnight Cyber (Oscuro)',
        isPredefined: true,
        colors: {
            '--background': '230 40% 5%', // Very dark blue
            '--foreground': '210 20% 88%',
            '--editor-background': '210 40% 15%',
            '--primary': '180 100% 50%', // Cyan
            '--primary-foreground': '230 40% 5%',
            '--secondary': '230 30% 15%',
            '--accent': '330 100% 55%', // Magenta
            '--border': '230 20% 20%',
            '--input': '230 25% 12%',
            '--ring': '180 100% 60%',
            '--input-background': '265 40% 15%',
            '--input-foreground': '255 5% 95%',
            '--text-muted': '210 20% 78%',
            '--text-subtle': '210 20% 58%',
            '--link': '180 100% 60%',
            '--link-hover': '180 100% 70%',
            '--special': '330 100% 60%',
            '--muted-foreground': '210 20% 68%',
            '--card-muted-foreground': '210 20% 68%',
            '--hero-muted-foreground': '210 20% 68%',
        }
    },
];

export const getThemeConfig = () => {
    try {
        const savedConfig = localStorage.getItem(THEME_CONFIG_KEY);
        if (savedConfig) {
            return JSON.parse(savedConfig);
        }
        return predefinedThemes.find(t => t.name === 'cosmic-latte') || predefinedThemes[0];
    } catch (error) {
        console.error("Error getting theme config:", error);
        return predefinedThemes.find(t => t.name === 'cosmic-latte') || predefinedThemes[0];
    }
};

export const saveThemeConfig = (theme) => {
    try {
        localStorage.setItem(THEME_CONFIG_KEY, JSON.stringify(theme));
    } catch (error) {
        console.error("Error saving theme config:", error);
    }
};

export const applyTheme = (theme) => {
    const root = document.documentElement;
    if (!theme || !theme.colors) return;
    
    // Set CSS variables
    Object.keys(theme.colors).forEach(key => {
        root.style.setProperty(key, theme.colors[key]);
    });

    // Set body class for tailwind theme extension
    document.body.className = Array.from(document.body.classList).filter(c => !c.startsWith('theme-')).join(' ');
    document.body.classList.add(`theme-${theme.name}`);
};

export const getCustomThemes = () => {
    try {
        const customThemes = localStorage.getItem('zona-vortex-custom-themes');
        return customThemes ? JSON.parse(customThemes) : [];
    } catch (error) {
        console.error("Error getting custom themes:", error);
        return [];
    }
}

export const saveCustomThemes = (themes) => {
    try {
        localStorage.setItem('zona-vortex-custom-themes', JSON.stringify(themes));
    } catch (error) {
        console.error("Error saving custom themes:", error);
    }
}