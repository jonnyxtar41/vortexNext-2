// src/components/AdLink.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAd } from '@/context/AdContext';

const AdLink = ({ to, children, className, ...props }) => {
    const { showAd } = useAd();
    const navigate = useNavigate();

    const handleClick = (e) => {
        // 1. Previene la navegación inmediata del <Link>
        e.preventDefault();
        // 2. Llama a showAd, pasándole la URL y la función para navegar
        showAd(to, () => navigate(to));
    };

    return (
        <Link to={to} onClick={handleClick} className={className} {...props}>
            {children}
        </Link>
    );
};

export default AdLink;