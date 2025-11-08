"use client";
// src/components/AdLink.jsx
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAd } from '@/app/context/AdContext';

const AdLink = ({ href, children, className, ...props }) => {
    const { showAd } = useAd();
    const router = useRouter();

    const handleClick = (e) => {
        // 1. Previene la navegación inmediata del <Link>
        e.preventDefault();
        // 2. Llama a showAd, pasándole la URL y la función para navegar
        showAd(href, () => router.push(href));
    };

    return (
        <Link href={href} onClick={handleClick} className={className} {...props}>
            {children}
        </Link>
    );
};

export default AdLink;