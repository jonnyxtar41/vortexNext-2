'use client';
import React, { useEffect, useState } from 'react';
import { Megaphone } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { getAdsConfig } from '@/lib/ads';
import parse from 'html-react-parser';

const AdBlock = ({ adKey, className = '', variant = 'default' }) => {
    const [adConfig, setAdConfig] = useState(null);
    const [isConfigured, setIsConfigured] = useState(false);

    useEffect(() => {
        const config = getAdsConfig();
        if (adKey && config[adKey]) {
            setAdConfig(config[adKey]);
        }
        setIsConfigured(true);
    }, [adKey]);

    const renderPlaceholder = () => {
        if (variant === 'banner') {
            return (
                <div className={cn("flex items-center justify-center p-4 my-8 bg-gray-800 border-2 border-dashed border-gray-600 rounded-lg text-center w-full", className)}>
                    <div className="flex items-center gap-4 text-gray-400">
                        <Megaphone className="w-8 h-8 text-yellow-400" />
                        <div>
                            <p className="font-bold text-md text-white">Espacio Publicitario</p>
                            <p className="text-xs">Este es un banner de anuncios.</p>
                        </div>
                    </div>
                </div>
            );
        }
        return (
            <div className={cn("flex items-center justify-center p-6 my-4 bg-gray-800 border-2 border-dashed border-gray-600 rounded-lg text-center", className)}>
                <div className="flex flex-col items-center gap-3 text-gray-400">
                    <Megaphone className="w-8 h-8 text-yellow-400" />
                    <div>
                        <p className="font-bold text-md text-white">Espacio Publicitario</p>
                        <p className="text-xs">Bloque no configurado</p>
                    </div>
                </div>
            </div>
        );
    };

    if (!isConfigured) {
        return null; // Don't render anything until config is checked
    }

    if (adConfig && adConfig.visible && adConfig.code) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className={cn("my-4 flex justify-center", className)}
                style={{ width: adConfig.width ? `${adConfig.width}px` : 'auto', height: adConfig.height ? `${adConfig.height}px` : 'auto', margin: '1rem auto' }}
            >
                {parse(adConfig.code)}
            </motion.div>
        );
    }
    
    if (adConfig && !adConfig.visible) {
        return null; // Ad is configured but not visible
    }

    // Fallback for unkeyed or unconfigured ads
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            {renderPlaceholder()}
        </motion.div>
    );
};

export default AdBlock;