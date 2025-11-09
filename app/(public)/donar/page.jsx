'use client';

import { useState, useEffect } from 'react';
import { getAllSiteContent } from '@/app/lib/supabase/siteContent';
import { Button } from '@/app/components/ui/button';

const DonatePage = () => {
    const [content, setContent] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchContent = async () => {
            setLoading(true);
            const allContent = await getAllSiteContent();
            const contentMap = allContent.reduce((acc, item) => {
                acc[item.key] = item.value;
                return acc;
            }, {});
            setContent(contentMap);
            setLoading(false);
        };

        fetchContent();
    }, []);

    const donationOptions = content.donation_options ? content.donation_options.split(',').map(o => o.trim()) : [];

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-4">{content.donation_page_title || 'Apoya Nuestro Proyecto'}</h1>
            <p className="text-lg text-gray-500 dark:text-gray-400 mb-8">{content.donation_page_description || 'Tu apoyo nos ayuda a seguir creando contenido de calidad.'}</p>
            
            {loading ? (
                <p>Cargando opciones de donación...</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {donationOptions.map(option => (
                        <div key={option} className="p-8 border rounded-lg text-center">
                            <p className="text-4xl font-bold mb-4">${option}</p>
                            <Button>Donar ${option}</Button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DonatePage;
