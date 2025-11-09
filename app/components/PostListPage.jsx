// app/components/PostListPage.jsx
'use client';

// Hooks de React y Next.js
import { useState, useTransition } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link'; // Importante: usar next/link

// Componentes UI (los mismos de tu proyecto)
import { motion } from 'framer-motion';
import { Calendar, User, Search, FileDown } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import AdLink from '@/app/components/AdLink';
import AdBlock from '@/app/components/AdBlock';
import Pagination from '@/app/components/Pagination';

/**
 * Este es el Componente Cliente que renderiza la UI.
 * Recibe los datos cargados desde el Server Component.
 */
const PostListPage = ({
    initialPosts,
    totalPages,
    currentPage,
    currentSearch,
    config, // { title, plural, searchPlaceholder, description, basePath }
    pageTitle,
    pageDescription
}) => {
    
    const router = useRouter();
    const pathname = usePathname(); // Obtiene la ruta actual (ej: /blog/desarrollo)
    
    // useTransition es para mostrar un estado de "cargando" mientras Next.js
    // busca los nuevos datos en el servidor.
    const [isPending, startTransition] = useTransition();

    // Estado local para el input de búsqueda (controlado)
    const [searchQuery, setSearchQuery] = useState(currentSearch);

    /**
     * Manejador para el formulario de búsqueda.
     * En lugar de actualizar en cada tecleo (como en Vite),
     * actualizamos cuando el usuario envía el formulario (presiona Enter).
     * Esto es MUCHO más eficiente en Next.js.
     */
    const handleSearchSubmit = (e) => {
        e.preventDefault();
        const newParams = new URLSearchParams();

        if (searchQuery) {
            newParams.set('q', searchQuery);
        }
        // No es necesario 'page', se reinicia a 1
        
        startTransition(() => {
            // router.push navega a la misma página pero con nuevos searchParams.
            // Esto hace que el Server Component se vuelva a ejecutar con los
            // nuevos datos (la búsqueda) y los pase a este componente.
            router.push(`${pathname}?${newParams.toString()}`);
        });
    };

    /**
     * Manejador de Paginación.
     * Funciona igual que el de búsqueda: navega a la misma URL
     * pero con un parámetro de 'page' diferente.
     */
    const handlePageChange = (newPage) => {
        const newParams = new URLSearchParams();

        // Conservar la búsqueda actual al paginar
        if (searchQuery) {
            newParams.set('q', searchQuery);
        }
        if (newPage > 1) {
            newParams.set('page', newPage);
        }
        
        startTransition(() => {
            router.push(`${pathname}?${newParams.toString()}`);
            // Scroll al inicio como en la versión de Vite
            window.scrollTo(0, 0);
        });
    };

    // El JSX es casi idéntico al de tu versión de Vite
    //
    // pero sin Helmet y sin la lógica de `loading` (ahora es `isPending`).
    return (
        <>
            {/* Helmet se maneja con generateMetadata en el page.jsx */}
            <main>
                <section className="pt-12 pb-20 px-6">
                    <div className="container mx-auto">
                        
                        {/* --- Encabezado --- */}
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            className="text-center mb-16"
                        >
                            <h1 className="text-5xl lg:text-7xl font-bold mb-6">
                                {/* Esta lógica de título ahora viene de las props */}
                                {pageTitle.includes("Todos los") ? (
                                    <>Todos los <span className="gradient-text">{config.plural}</span></>
                                ) : (
                                    <>{pageTitle}</>
                                )}
                            </h1>
                            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                                {pageDescription}
                            </p>
                        </motion.div>
                        
                        {/* --- Barra de Búsqueda --- */}
                        <motion.form 
                            onSubmit={handleSearchSubmit} // IMPORTANTE: Usar onSubmit
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="max-w-xl mx-auto mb-16 relative"
                        >
                            <Input
                                type="text"
                                placeholder={config.searchPlaceholder}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)} // Solo actualiza el estado local
                                className="w-full pl-12 pr-4 py-6 text-lg bg-black/30 border-2 border-white/20 rounded-full focus:ring-purple-500 focus:border-purple-500"
                            />
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            {/* El usuario puede presionar Enter para buscar */}
                        </motion.form>

                        <AdBlock className="mb-16" />

                        {/* --- Grid de Posts --- */}
                        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-12">
                            {initialPosts.map((post, index) => (
                                <motion.div
                                    key={`${post.id}-${index}`}
                                    initial={{ opacity: 0, y: 50 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6, delay: index * 0.1 }}
                                    viewport={{ once: true }}
                                    className="glass-effect rounded-2xl overflow-hidden flex flex-col group card-hover"
                                >
                                    {/* Enlazamos al post individual */}
                                    <AdLink href={`/post/${post.slug}`} className="flex flex-col h-full">
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
                        
                        {/* Estado de Carga (mientras se navega) */}
                        {isPending && (
                            <div className="text-center text-muted-foreground mt-16">Cargando {config.plural.toLowerCase()}...</div>
                        )}
                        
                        {/* Sin resultados */}
                        {initialPosts.length === 0 && !isPending && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-center text-muted-foreground mt-16"
                            >
                                <p>No se encontraron {config.plural.toLowerCase()} que coincidan con tu búsqueda o filtro.</p>
                                {/* El Link ahora debe usar 'href' en lugar de 'to' */}
                                <Link href={config.basePath}>
                                    <Button variant="link" className="text-primary">Ver todos los {config.plural.toLowerCase()}</Button>
                                </Link>
                            </motion.div>
                        )}
                        
                       {/* Paginación */}
                       <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                        />
                    </div>
                </section>
            </main>
        </>
    );
};

export default PostListPage;