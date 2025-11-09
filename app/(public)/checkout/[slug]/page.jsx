'use client';

import { useState, useEffect } from 'react';
import { getPostBySlug } from '@/app/lib/supabase/posts';
import { useParams } from 'next/navigation';
import { Button } from '@/app/components/ui/button';

const CheckoutPage = () => {
    const { slug } = useParams();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPost = async () => {
            if (!slug) return;
            setLoading(true);
            const postData = await getPostBySlug(slug);
            setPost(postData);
            setLoading(false);
        };

        fetchPost();
    }, [slug]);

    if (loading) {
        return <p>Cargando...</p>;
    }

    if (!post) {
        return <p>Post no encontrado.</p>;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-4">Checkout</h1>
            <div className="border rounded-lg p-8">
                <h2 className="text-2xl font-bold mb-4">{post.title}</h2>
                <p className="text-lg mb-4">Precio: ${post.price}</p>
                <Button>Pagar</Button>
            </div>
        </div>
    );
};

export default CheckoutPage;
