import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { Calendar, User, Search, FileDown  } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link, useSearchParams } from 'react-router-dom';
import { getPosts } from '@/lib/supabase/posts';
import AdLink from '@/components/AdLink';
import AdBlock from '@/components/AdBlock';
import Pagination from '@/components/Pagination';

const POSTS_PER_PAGE = 9;

const sectionConfig = {
    'blog': {
        title: "Blog",
        plural: "Artículos",
        searchPlaceholder: "Buscar artículos...",
        description: "Explora nuestros artículos sobre tecnología, desarrollo personal, y más.",
    },
    'recursos-de-ingles': {
        title: "Recursos de Inglés",
        plural: "Recursos",
        searchPlaceholder: "Buscar recursos de inglés...",
        description: "Encuentra todo lo que necesitas para tu viaje de aprendizaje de inglés.",
    },
    'resenas': {
        title: "Reseñas",
        plural: "Reseñas",
        searchPlaceholder: "Buscar reseñas...",
        description: "Lee nuestros análisis y críticas de productos, películas, y más.",
    }
};

const Recursos = ({ section }) => {
    const { toast } = useToast();
    const [posts, setPosts] = useState([]);
    const [totalPosts, setTotalPosts] = useState(0);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchParams, setSearchParams] = useSearchParams();
    const categoryFilter = searchParams.get('categoria');
    const subcategoryFilter = searchParams.get('subcategoria');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const config = useMemo(() => sectionConfig[section] || sectionConfig['blog'], [section]);

    const fetchPosts = useCallback(async () => {
        setLoading(true);
        const { data, count } = await getPosts({
            section,
            categoryName: categoryFilter,
            subcategoryName: subcategoryFilter,
            searchQuery,
            page: page,
            limit: POSTS_PER_PAGE,
        });

        if (data) {
            setPosts(data);
            setTotalPosts(count);
        } else {
            toast({
                title: `Error al cargar los ${config.plural.toLowerCase()}`,
                description: `Hubo un problema al obtener los posts. Por favor, intenta de nuevo.`,
                variant: "destructive"
            });
        }
        
        setLoading(false);
    }, [categoryFilter, subcategoryFilter, searchQuery, page, toast, section, config.plural]);

    useEffect(() => {
        fetchPosts();
        window.scrollTo(0, 0);
    }, [fetchPosts, page]);

    const handleSearchChange = (e) => {
        const query = e.target.value;
        setSearchQuery(query);
        const newParams = new URLSearchParams();
        if (query) {
            newParams.set('q', query);
        }
        setSearchParams(newParams);
    };
    
    const handlePageChange = (newPage) => {
        const newParams = new URLSearchParams(searchParams);
        newParams.set('page', newPage);
        setSearchParams(newParams);
    };
    
    let pageTitle;
    let pageDescription;

    if (subcategoryFilter) {
        pageTitle = `${config.plural} de ${subcategoryFilter}`;
        pageDescription = `Explora nuestros ${config.plural.toLowerCase()} sobre ${subcategoryFilter}.`;
    } else if (categoryFilter) {
        pageTitle = `${config.plural} de ${categoryFilter}`;
        pageDescription = `Explora nuestros ${config.plural.toLowerCase()} sobre ${categoryFilter}.`;
    } else {
        pageTitle = `Todos los ${config.plural}`;
        pageDescription = config.description;
    }

    const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);

    return (
        <>
            <Helmet>
                <title>{pageTitle} - Zona Vortex</title>
                <meta name="description" content={pageDescription} />
                <meta property="og:title" content={`${pageTitle} - Zona Vortex`} />
                <meta property="og:description" content={pageDescription} />
            </Helmet>
            <main>
                <section className="pt-12 pb-20 px-6">
                    <div className="container mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            className="text-center mb-16"
                        >
                            <h1 className="text-5xl lg:text-7xl font-bold mb-6">
                               {categoryFilter ? <>{subcategoryFilter ? subcategoryFilter : categoryFilter}</> : <>Todos los <span className="gradient-text">{config.plural}</span></>}
                            </h1>
                            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                                {pageDescription}
                            </p>
                        </motion.div>
                        
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="max-w-xl mx-auto mb-16 relative">
                            <Input
                                type="text"
                                placeholder={config.searchPlaceholder}
                                value={searchQuery}
                                onChange={handleSearchChange}
                                className="w-full pl-12 pr-4 py-6 text-lg bg-black/30 border-2 border-white/20 rounded-full focus:ring-purple-500 focus:border-purple-500"
                            />
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        </motion.div>

                        <AdBlock className="mb-16" />

                        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-12">
                            {posts.map((post, index) => (
                                <motion.div
                                    key={`${post.id}-${index}`}
                                    initial={{ opacity: 0, y: 50 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6, delay: index * 0.1 }}
                                    viewport={{ once: true }}
                                    className="glass-effect rounded-2xl overflow-hidden flex flex-col group card-hover"
                                >
                                    <AdLink to={`/${section}/${post.slug}`} className="flex flex-col h-full">
                                        <div className="overflow-hidden relative">
                                            <img className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-500" alt={post.image_description} src={post.main_image_url || "https://images.unsplash.com/photo-1595872018818-97555653a011"} />
                                            <div className={`absolute inset-0 bg-gradient-to-t ${post.categories?.gradient || 'from-gray-500 to-gray-700'} opacity-50`}></div>
                                            {post.download && (
                                                <div className="absolute top-2 right-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                                                    <FileDown size={14} />
                                                    <span>Descargable</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-6 flex flex-col flex-grow">
                                            <div className="mb-4">
                                                <span className={`bg-gradient-to-r ${post.categories?.gradient || 'from-gray-500 to-gray-700'} text-white text-xs font-semibold px-3 py-1 rounded-full`}>{post.categories?.name || 'Sin Categoría'}</span>
                                            </div>
                                            <h3 className="text-2xl font-bold mb-3 text-foreground flex-grow">
                                                {post.title}
                                            </h3>
                                            <p className="text-muted-foreground leading-relaxed mb-4">
                                                {post.excerpt}
                                            </p>
                                            <div className="flex justify-between items-center text-sm text-text-subtle mt-auto pt-4 border-t border-border">
                                                {post.show_author && post.custom_author_name ? (
                                                  <div className="flex items-center space-x-1.5">
                                                      <User size={14} />
                                                      <span>{post.custom_author_name}</span>
                                                  </div>
                                                ) : <div />}
                                                {post.show_date && (
                                                  <div className="flex items-center space-x-1.5">
                                                      <Calendar size={14} />
                                                      <span>{post.date}</span>
                                                  </div>
                                                )}
                                            </div>
                                        </div>
                                    </AdLink>
                                </motion.div>
                            ))}
                        </div>
                        
                        {loading && (
                            <div className="text-center text-muted-foreground mt-16">Cargando {config.plural.toLowerCase()}...</div>
                        )}
                        
                        {posts.length === 0 && !loading && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-center text-muted-foreground mt-16"
                            >
                                <p>No se encontraron {config.plural.toLowerCase()} que coincidan con tu búsqueda o filtro.</p>
                                {categoryFilter && <Link to={`/${section}`}><Button variant="link" className="text-primary">Ver todos los {config.plural.toLowerCase()}</Button></Link>}
                            </motion.div>
                        )}
                        
                       <Pagination
                            currentPage={page}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                        />
                    </div>
                </section>
            </main>
        </>
    );
};

export default Recursos;