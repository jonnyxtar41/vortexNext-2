const AD_CONFIG_KEY = 'zona-vortex-ads-config';

const defaultAdsConfig = {
    adsenseClientId: 'ca-pub-5631795975075125', // Default AdSense client ID
    interstitial: {
        id: 'interstitial',
        name: 'Anuncio de Transición (Interstitial)',
        visible: true,
        width: 500,
        height: 300,
        countdown: 5,
        code: '',
    },
    'sidebar-top': {
        id: 'sidebar-top',
        name: 'Barra Lateral (Superior)',
        visible: true,
        width: 300,
        height: 250,
        code: '',
    },
    'post-body': {
        id: 'post-body',
        name: 'Dentro del Contenido del Post',
        visible: true,
        width: '100%',
        height: 280,
        code: '',
    },
    'home-middle': {
        id: 'home-middle',
        name: 'Página de Inicio (Intermedio)',
        visible: true,
        width: 728,
        height: 90,
        code: '',
    },
    'footer-banner': {
        id: 'footer-banner',
        name: 'Banner en el Pie de Página',
        visible: true,
        width: 728,
        height: 90,
        code: '',
    },
};

export const getAdsConfig = () => {
    // Check if running on the client side
    if (typeof window === 'undefined') {
        return defaultAdsConfig;
    }

    try {
        const savedConfig = localStorage.getItem(AD_CONFIG_KEY);
        if (savedConfig) {
            const parsed = JSON.parse(savedConfig);
            // Merge with defaults to ensure new ad slots are added
            return { ...defaultAdsConfig, ...parsed };
        }
        return defaultAdsConfig;
    } catch (error) {
        console.error("Error getting ad config:", error);
        return defaultAdsConfig;
    }
};

export const saveAdsConfig = (config) => {
    try {
        localStorage.setItem(AD_CONFIG_KEY, JSON.stringify(config));
    } catch (error) {
        console.error("Error saving ad config:", error);
    }
};