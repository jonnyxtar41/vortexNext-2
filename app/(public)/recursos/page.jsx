'use client';

import { useState, useEffect } from 'react';
import { getPosts } from '@/lib/supabase/posts';
import Link from 'next/link';

const RecursosPage = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPosts = async () => {
            setLoading(true);
            const { data, error } = await getPosts({ section: 'recursos' });
            if (error) {
                console.error('Error fetching posts:', error);
            } else {
                setPosts(data);
            }
            setLoading(false);
        };

        fetchPosts();
    }, []);

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Recursos</h1>
            {loading ? (
                <p>Cargando...</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {posts.map(post => (
                        <Link key={post.id} href={`/recursos/${post.slug}`}>
                            <a className="block p-4 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                                <h2 className="text-xl font-bold">{post.title}</h2>
                                <p className="text-gray-500 dark:text-gray-400">{post.excerpt}</p>
                            </a>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default RecursosPage;
