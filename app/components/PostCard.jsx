// app/components/PostCard.jsx
'use client';

import AdLink from '@/app/components/AdLink';
import { FileDown } from 'lucide-react';

// Este es el PostCard que estaba definido en tu Post.jsx de Vite
const PostCard = ({ post, section }) => (
    <AdLink href={`/${section}/${post.slug}`} className="block group">
    <div className="glass-effect p-4 rounded-lg transition-all duration-300 hover:bg-white/10 hover:scale-105 h-full flex flex-col">
        <div className="relative w-full aspect-video rounded-md mb-4 overflow-hidden">
        <img
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            alt={post.image_description || post.title}
            src={post.main_image_url || "https://images.unsplash.com/photo-1681308919176-484da2600cb5"} />
        {post.download && (
            <div className="absolute top-2 right-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                <FileDown size={14} />
                <span>Descargable</span>
            </div>
        )}
        </div>
        <div className="flex-grow flex flex-col">
            <h3 className="font-bold text-md mb-1 group-hover:text-link-hover transition-colors flex-grow">{post.title}</h3>
            <p className="text-xs text-muted-foreground mt-auto">{post.categories?.name || 'Sin categoría'}</p>
        </div>
    </div>
    </AdLink>
);

export default PostCard;