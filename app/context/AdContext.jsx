'use client';
// src/context/AdContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { getAdsConfig } from '@/lib/ads';

const AdContext = createContext();

export const useAd = () => useContext(AdContext);

export const AdProvider = ({ children }) => {
    const [isAdVisible, setIsAdVisible] = useState(false);
    // Guardará la función que ejecuta la navegación
    const [navigateTo, setNavigateTo] = useState(null);
    const [adsConfig, setAdsConfig] = useState(null);

    useEffect(() => {
        const updateConfig = () => setAdsConfig(getAdsConfig());
        updateConfig();
        window.addEventListener('storage', updateConfig);
        return () => window.removeEventListener('storage', updateConfig);
    }, []);

    const showAd = (url, navigateCallback) => {
        if (adsConfig?.interstitial?.visible) {
            setNavigateTo(() => navigateCallback); // Guarda la función para navegar
            setIsAdVisible(true);
        } else {
            navigateCallback(); // Si los anuncios están desactivados, navega directamente
        }
    };

    const hideAd = () => {
        setIsAdVisible(false);
        if (navigateTo) {
            navigateTo(); // Ejecuta la navegación pendiente
            setNavigateTo(null); // Limpia para el próximo uso
        }
    };

    const value = {
        isAdVisible,
        showAd,
        hideAd,
    };

    return <AdContext.Provider value={value}>{children}</AdContext.Provider>;
};