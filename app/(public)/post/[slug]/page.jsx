'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Calendar, User, Download, Share2, BookOpen, ChevronsRight, FileDown, ChevronRight, Facebook, Twitter, Linkedin, Copy, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from "@/components/ui/use-toast";
import { getPostBySlug, getPosts, incrementPostStat, getRelatedPosts } from '@/lib/supabase/posts';
import AdBlock from '@/components/AdBlock';
import AdLink from '@/components/AdLink';
import { useDownloadModal } from '@/context/DownloadModalContext';
import parse, { domToReact } from 'html-react-parser';
import DOMPurify from 'dompurify';
import CommentsSection from '@/components/CommentsSection';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

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

export async function generateMetadata({ params }) {
  const post = await getPostBySlug(params.slug);
  if (!post) {
    return {
      title: 'Post no encontrado',
      description: 'El post que estás buscando no existe o ha sido movido.',
    };
  }
  return {
    title: `${post.meta_title || post.title} - Zona Vortex`,
    description: post.meta_description || post.excerpt,
    openGraph: {
      title: post.meta_title || post.title,
      description: post.meta_description || post.excerpt,
      images: post.main_image_url ? [post.main_image_url] : [],
    },
    keywords: post.keywords || [],
  };
}

const Post = ({ params }) => {
    const { slug } = params;
    const [post, setPost] = useState(null);
    const [recommendedPosts, setRecommendedPosts] = useState([]);
    const [similarPosts, setSimilarPosts] = useState([]);
    const [currentUrl, setCurrentUrl] = useState('');
    const { toast } = useToast();
    const { showModal } = useDownloadModal();
    const router = useRouter();

    useEffect(() => {
        setCurrentUrl(window.location.href);
    }, [slug]);

    const fetchData = useCallback(async () => {
        const foundPost = await getPostBySlug(slug);
        setPost(foundPost);

        if (foundPost) {
            incrementPostStat(foundPost.id, 'visits');

            const [{ data: allPosts }, relatedPostsData] = await Promise.all([
                getPosts({ section: foundPost.sections?.slug }),
                getRelatedPosts(foundPost.id, foundPost.keywords, 3)
            ]);
            
            const recommended = allPosts
              .filter(p => p.id !== foundPost.id && !relatedPostsData.some(rp => rp.id === p.id))
              .sort(() => 0.5 - Math.random())
              .slice(0, 4);
            setRecommendedPosts(recommended);

            let finalSimilarPosts = [...relatedPostsData];
            if (finalSimilarPosts.length < 3) {
                const categoryPosts = allPosts
                    .filter(p => 
                        p.category_id === foundPost.category_id && 
                        p.id !== foundPost.id && 
                        !finalSimilarPosts.some(sp => sp.id === p.id)
                    );
                finalSimilarPosts.push(...categoryPosts.slice(0, 3 - finalSimilarPosts.length));
            }
            
            setSimilarPosts(finalSimilarPosts);
        }

        window.scrollTo(0, 0);
    }, [slug]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);
    
    const handleCopyLink = () => {
        navigator.clipboard.writeText(currentUrl);
        toast({ title: "Enlace copiado al portapapeles" });
    };

    const handleDownload = () => {
        if (!post.download) {
            toast({
                title: `🚧 Descarga no implementada`,
                description: `¡Esta función estará disponible pronto! 🚀`,
            });
            return;
        }

        if (post.is_premium) {
            router.push(`/checkout/${post.slug}`);
            return;
        }

        const downloadFunction = () => {
            incrementPostStat(post.id, 'downloads');
            
            const downloadUrl = post.download.url;
            if (!downloadUrl) {
                toast({ title: "❌ URL de descarga no encontrada.", variant: "destructive" });
                return;
            }
            
            window.open(downloadUrl, '_blank', 'noopener,noreferrer');
            toast({
                title: "📥 ¡Descarga iniciada!",
                description: `${post.title} se está abriendo en una nueva pestaña.`
            });
        };

        showModal({ title: post.title, onConfirm: downloadFunction });
    };

    const parseOptions = {
        replace: domNode => {
            if (domNode.attribs && domNode.attribs['data-ad-block']) {
                return <AdBlock />;
            }
            if (domNode.name === 'iframe') {
                return (
                <div className="relative h-0 pb-[56.25%] overflow-hidden my-6">
                    <iframe
                        {...domNode.attribs}
                        className="absolute top-0 left-0 w-full h-full"
                    />
                </div>
                );
            }
            if (domNode.name === 'img') {
                const { class: className, style, ...attribs } = domNode.attribs;
                const alignClass = className?.match(/align-(center|right|left)/)?.[0] || '';

                const styleObject = {};
                if (style) {
                    style.split(';').forEach(declaration => {
                    const [property, value] = declaration.split(':');
                    if (property && value) {
                        const camelCaseProperty = property.trim().replace(/-(\w)/g, (match, letter) => letter.toUpperCase());
                        styleObject[camelCaseProperty] = value.trim();
                    }
                    });
                }

                return <img {...attribs} className={alignClass} style={styleObject} />;
            }
        }
    };

    const getImageSizeClass = (size) => {
        switch (size) {
            case 'small':
            return 'max-w-md mx-auto';
            case 'large':
            return 'w-full';
            case 'medium':
            default:
            return 'max-w-2xl mx-auto';
        }
    };

    if (!post) {
        return (
            <div className="min-h-screen flex items-center justify-center">
            <p className="text-xl">Cargando contenido...</p>
            </div>
        );
    }

    const currentSectionSlug = post.sections?.slug || 'post';
    const categoryLink = post.categories ? `/${currentSectionSlug}?categoria=${encodeURIComponent(post.categories.name)}` : `/${currentSectionSlug}`;
    const subcategoryLink = post.categories && post.subcategories ? `/${currentSectionSlug}?categoria=${encodeURIComponent(post.categories.name)}&subcategoria=${encodeURIComponent(post.subcategories.name)}` : `/${currentSectionSlug}`;

    return (
        <main className="pt-8 pb-20">
            <div className="container mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-8"
                >
                    <nav aria-label="breadcrumb" className="flex items-center text-sm text-muted-foreground flex-wrap">
                        <Link href="/" className="hover:text-foreground transition-colors">Inicio</Link>
                        <ChevronRight className="w-4 h-4 mx-1" />
                        <Link href={`/${currentSectionSlug}`} className="hover:text-foreground transition-colors">{post.sections?.name || 'Sección'}</Link>
                        {post.categories && (
                        <>
                            <ChevronRight className="w-4 h-4 mx-1" />
                            <Link href={categoryLink} className="hover:text-foreground transition-colors">
                            {post.categories.name}
                            </Link>
                        </>
                        )}
                        {post.subcategories && (
                        <>
                            <ChevronRight className="w-4 h-4 mx-1" />
                            <Link href={subcategoryLink} className="hover:text-foreground transition-colors">
                                {post.subcategories.name}
                            </Link>
                        </>
                    )}
                    </nav>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    <article className="lg:col-span-8">
                        <motion.header
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            className="mb-12">
                            <div className="mb-4 flex items-center text-sm font-semibold text-foreground flex-wrap gap-2">
                                {post.categories && (
                                <Link href={categoryLink} className={`bg-gradient-to-r ${post.categories.gradient || 'from-gray-500 to-gray-700'} px-4 py-1 rounded-full hover:brightness-125 transition-all`}>
                                    {post.categories.name}
                                </Link>
                                )}
                                {post.subcategories && (
                                <>
                                    <ChevronsRight className="w-5 h-5 text-text-subtle" />
                                    <Link href={subcategoryLink} className="bg-white/10 px-4 py-1 rounded-full hover:bg-white/20 transition-all">
                                    {post.subcategories.name}
                                    </Link>
                                </>
                                )}
                            </div>
                            <h1 className="text-4xl md:text-6xl font-bold mb-6">{post.title}</h1>
                            <div className="flex items-center space-x-6 text-muted-foreground">
                                {post.show_author && (
                                <div className="flex items-center space-x-2">
                                    <User size={16} />
                                    <span>{post.custom_author_name || post.author}</span>
                                </div>
                                )}
                                {post.show_date && (
                                <div className="flex items-center space-x-2">
                                    <Calendar size={16} />
                                    <span>{new Date(post.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                </div>
                                )}
                            </div>
                        </motion.header>

                        {post.show_main_image_in_post && post.main_image_url && (
                            <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className={`mb-12 ${getImageSizeClass(post.main_image_size_in_post)}`}
                            >
                            <img src={post.main_image_url} className="w-full h-auto object-cover rounded-2xl shadow-2xl" alt={post.image_description || post.title} />
                            </motion.div>
                        )}

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.8, delay: 0.4 }}
                        >
                            {post.custom_fields && post.custom_fields.length > 0 && (
                                <div className="my-8 p-6 glass-effect rounded-lg">
                                    <h3 className="text-xl font-bold mb-4 text-foreground">Detalles Adicionales</h3>
                                    <ul className="space-y-2">
                                        {post.custom_fields.map((field, index) => field.key && (
                                            <li key={index} className="flex justify-between border-b border-border/50 pb-2">
                                                <span className="font-semibold text-muted-foreground">{field.key}:</span>
                                                <span className="text-right text-foreground">{field.value}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            
                            <div className="prose prose-invert prose-lg max-w-none text-muted-foreground prose-headings:text-foreground prose-h2:text-3xl prose-p:leading-relaxed prose-a:text-link hover:prose-a:text-link-hover prose-img:rounded-xl">
                            {post.content && parse(DOMPurify.sanitize(post.content, {
                                ADD_TAGS: ['table', 'tbody', 'tr', 'td', 'th', 'thead', 'colgroup', 'col'],
                                ADD_ATTR: ['style', 'class', 'colspan', 'rowspan']
                            }), parseOptions)}
                            </div>

                            <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4">
                            <p className="text-muted-foreground text-sm">¿Te gustó este contenido?</p>
                            <div className="flex gap-4">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="border-border text-foreground hover:bg-secondary">
                                        <Share2 size={16} className="mr-2" /> Compartir
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}&quote=${encodeURIComponent(post.title)}`, '_blank')}>
                                        <Facebook className="w-4 h-4 mr-2" /> Facebook
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(post.title)}`, '_blank')}>
                                        <Twitter className="w-4 h-4 mr-2" /> Twitter
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => window.open(`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(currentUrl)}&title=${encodeURIComponent(post.title)}&summary=${encodeURIComponent(post.excerpt)}&source=${encodeURIComponent(window.location.origin)}`, '_blank')}>
                                        <Linkedin className="w-4 h-4 mr-2" /> LinkedIn
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(post.title + " " + currentUrl)}`, '_blank')}>
                                        <MessageCircle className="w-4 h-4 mr-2" /> WhatsApp
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={handleCopyLink}>
                                        <Copy className="w-4 h-4 mr-2" /> Copiar Enlace
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                            {post.download && (
                                <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white" onClick={handleDownload}>
                                <Download size={16} className="mr-2" /> Descargar Material
                                </Button>
                            )}
                            </div>
                            </div>
                            {post.comments_enabled && <CommentsSection postId={post.id} />}
                        </motion.div>
                    </article>

                    <aside className="lg:col-span-4">
                        <div className="sticky top-28 space-y-12">
                            <AdBlock />
                            <div className="glass-effect p-6 rounded-2xl">
                            <h2 className="text-2xl font-bold mb-6 flex items-center">
                                <BookOpen className="mr-3 text-primary" />
                                Recomendados
                            </h2>
                            <div className="space-y-6">
                                {recommendedPosts.map(recPost => (
                                <Link href={`/${recPost.sections?.slug || 'blog'}/${recPost.slug}`} key={recPost.id} className="flex items-center gap-4 group">
                                    <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden">
                                    <img
                                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                        alt={recPost.image_description || recPost.title}
                                        src={recPost.main_image_url || "https://images.unsplash.com/photo-1540159453465-731d5a46060a"} />
                                    </div>
                                    <div>
                                    <h3 className="font-semibold leading-tight group-hover:text-link-hover transition-colors">{recPost.title}</h3>
                                    <p className="text-xs text-text-subtle mt-1">{new Date(recPost.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                    </div>
                                </Link>
                                ))}
                            </div>
                            </div>
                        </div>
                    </aside>
                </div>

                {similarPosts.length > 0 && (
                    <motion.section
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    className="mt-24 pt-16 border-t-2 border-border"
                    >
                    <h2 className="text-4xl font-bold text-center mb-12">Entradas Similares</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {similarPosts.map(simPost => (
                        <PostCard key={simPost.id} post={simPost} section={currentSectionSlug} />
                        ))}
                    </div>
                    </motion.section>
                )}
            </div>
        </main>
    );
};

export default Post;
