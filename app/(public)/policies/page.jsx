'use client';

import { useState, useEffect } from 'react';
import { getAllSiteContent } from '@/lib/supabase/siteContent';
import parse from 'html-react-parser';

const PoliciesPage = () => {
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchContent = async () => {
            setLoading(true);
            const allContent = await getAllSiteContent();
            const contentMap = allContent.reduce((acc, item) => {
                acc[item.key] = item.value;
                return acc;
            }, {});
            setContent(contentMap.policies_page_content || '');
            setLoading(false);
        };

        fetchContent();
    }, []);

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Políticas de Privacidad</h1>
            {loading ? (
                <p>Cargando...</p>
            ) : (
                <div className="prose dark:prose-invert max-w-none">
                    {parse(content)}
                </div>
            )}
        </div>
    );
};

export default PoliciesPage;
