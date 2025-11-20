// app/(public)/[...slug]/page.jsx

import { getPosts } from '@/app/lib/supabase/client';
import PostListPage from '@/app/components/PostListPage';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { createClient } from '@/app/utils/supabase/server';

import { getCategories } from '@/app/lib/supabase/categories'; // Temporal, si necesitas categorías

const POSTS_PER_PAGE = 9;

async function getTaxonomyData(slugArray) {
    const supabase = createClient();
    const [sectionSlug, categorySlug, subcategorySlug] = slugArray;

    if (sectionSlug === 'explorar') {
        return {
            section: { 
                id: 'all', // ID ficticio
                name: 'Explorar', 
                slug: 'explorar', 
                plural_name: 'Publicaciones' 
            },
            category: null,
            subcategory: null,
            pageTitle: 'Explorar Contenido',
            pageDescription: 'Descubre todos nuestros artículos, recursos y noticias en un solo lugar.',
            config: {
                title: 'Explorar',
                plural: 'Publicaciones',
                searchPlaceholder: 'Buscar en todo el sitio...',
                description: 'Explora todo nuestro contenido.',
                basePath: '/explorar'
            }
        };
    }

    let section, category, subcategory;

    // 1. Obtener Sección (requerida)
    const { data: sectionData } = await supabase
        .from('sections')
        .select('*')
        .eq('slug', sectionSlug)
        .single();
    
    if (!sectionData) {
        console.warn(`[Taxonomy] Sección no encontrada: ${sectionSlug}`);
        return null; // No se encontró la sección, esto será un 404
    }
    section = sectionData;

    // 2. Obtener Categoría (opcional)
    if (categorySlug) {
        const { data: categoryData } = await supabase
            .from('categories')
            .select('*')
            .eq('slug', categorySlug)
            .eq('section_id', section.id) // Asegura que pertenece a la sección
            .single();
        
        if (!categoryData) {
            console.warn(`[Taxonomy] Categoría no encontrada: ${categorySlug}`);
            return null; // Slug de categoría no válido, esto será un 404
        }
        category = categoryData;
    }

    // 3. Obtener Subcategoría (opcional)
    if (category && subcategorySlug) {
        const { data: subcategoryData } = await supabase
            .from('subcategories')
            .select('*')
            .eq('slug', subcategorySlug)
            .eq('category_id', category.id) // Asegura que pertenece a la categoría
            .single();

        if (!subcategoryData) {
            console.warn(`[Taxonomy] Subcategoría no encontrada: ${subcategorySlug}`);
            return null; // Slug de subcategoría no válido, esto será un 404
        }
        subcategory = subcategoryData;
    }

    // --- Construir Configuración de Página (Dinámica) ---
    // Esto reemplaza el 'sectionConfig' estático
    let pageTitle, pageDescription, config;

    config = {
        title: section.name,
        plural: section.plural_name || 'Publicaciones', // Asume que tienes un campo 'plural_name' en tu tabla 'sections'
        searchPlaceholder: `Buscar en ${section.plural_name || 'todo'}...`,
        description: section.description || `Explora ${section.plural_name || 'nuestras publicaciones'}.`,
        basePath: `/${section.slug}`
    };

    if (subcategory) {
        pageTitle = subcategory.name;
        pageDescription = subcategory.description || `Explora ${config.plural.toLowerCase()} sobre ${subcategory.name}.`;
        config.basePath = `/${section.slug}/${category.slug}/${subcategory.slug}`;
    } else if (category) {
        pageTitle = category.name;
        pageDescription = category.description || `Explora ${config.plural.toLowerCase()} sobre ${category.name}.`;
        config.basePath = `/${section.slug}/${category.slug}`;
    } else {
        pageTitle = `Todos los ${config.plural}`;
        pageDescription = config.description;
    }

    return {
        section,
        category,
        subcategory,
        pageTitle,
        pageDescription,
        config
    };
}

// --- Generación de Metadata (SEO) ---
export async function generateMetadata({ params, searchParams }) {
    const slugArray = params.slug || [];
    const taxData = await getTaxonomyData(slugArray);

    if (!taxData) {
        return {
            title: 'No encontrado - Zona Vortex',
            description: 'El contenido que buscas no está disponible.'
        };
    }

    const { pageTitle, pageDescription } = taxData;
    
    return {
        title: `${pageTitle} - Zona Vortex`,
        description: pageDescription,
        openGraph: {
            title: `${pageTitle} - Zona Vortex`,
            description: pageDescription,
        },
    };
}


// --- El Componente Page (Server Component) ---
export default async function DynamicPostListPage({ params, searchParams }) {
    const supabase = createClient();

    
    const slugArray = params.slug || [];
    
    
    // Evita que esta ruta dinámica capture rutas reservadas de la aplicación.
    const RESERVED_PATHS = ['admin', 'control-panel-7d8a2b3c4f5e', 'login', 'register', 'auth', 'edit-post', 'forgot-password', 'update-password'];
    if (RESERVED_PATHS.includes(slugArray[0])) {
        notFound();
    }

    // --- 1. Obtener datos de Taxonomía ---
    const taxData = await getTaxonomyData(slugArray);

    // Si la taxonomía no es válida (ej: /wiki-vortex), mostramos 404
    if (!taxData) {
        notFound();
    }

    const { section, category, subcategory, pageTitle, pageDescription, config } = taxData;

    // --- 2. Búsqueda y Paginación ---
    const page = parseInt(searchParams.page || '1', 10);
    const searchQuery = searchParams.q || '';

    // --- LÓGICA PARA BUSCAR CATEGORY ID ---
    let categoryIdToFilter = null;
    const categoryQuery = searchParams.cat || null;
    const normalizedCategoryName = categoryQuery ? categoryQuery.toLowerCase().trim() : null; 
    
    if (section.slug === 'explorar' && normalizedCategoryName) {
        const allCategories = await getCategories(supabase);
        const foundCategory = allCategories.find(c => 
            c.name?.toLowerCase().trim() === normalizedCategoryName
        );
        
        if (foundCategory) {
            categoryIdToFilter = foundCategory.id;
            console.log(`[DEBUG VORTEX] Category ID encontrado para "${normalizedCategoryName}": ${categoryIdToFilter}`);
        } else {
            console.warn(`[DEBUG VORTEX] Category ID NO encontrado para "${normalizedCategoryName}". Esto podría indicar un error de datos en la DB.`);
        }
    }
    // --- FIN DE LÓGICA DE BÚSQUEDA DE CATEGORY ID ---
    
   
    const normalizedSectionSlug = section.slug ? section.slug.toLowerCase().trim() : null;




// 1. Define tus parámetros de consulta base
    let postParams = {
        section: normalizedSectionSlug === 'explorar' ? null : normalizedSectionSlug,
        categoryId: categoryIdToFilter,
        categoryName: null,
        subcategoryName: subcategory?.name,
        searchQuery: searchQuery,
        page: page,
        limit: POSTS_PER_PAGE,
        onlyDownloadable: false, // Default a false
        isPremium: null          // Default a null (usa el filtro de client.js)
    };
    console.log('[DEBUG VORTEX] Parámetros de PostQuery FINAL:', postParams);

    // 2. Comprueba si estamos en la sección "Freemium"
    if (section.slug === 'zona-freemium') {
        // 3. ¡Sobrescribe los filtros!
        postParams.categoryId = null;
        postParams.section = null;          // NO filtres por esta se   cción
        postParams.categoryName = null;     // NO filtres por categoría
        postParams.subcategoryName = null;  // NO filtres por subcategoría
        postParams.isPremium = true;      // <-- ¡Pide solo posts Premium!
        postParams.onlyDownloadable = true; // <-- Y que también sean descargables
    } else {
        // (Opcional) Si la zona-freemium es la ÚNICA que muestra descargables
        //       postParams.onlyDownloadable = false; 
    }

    // 4. Llama a getPosts con los parámetros correctos
    const { data: posts, count: totalPosts } = await getPosts(supabase, postParams);


    const totalPages = Math.ceil((totalPosts || 0) / POSTS_PER_PAGE);

    // --- 4. Renderizar Componente Cliente ---
    return (
        <Suspense fallback={<div>Cargando UI...</div>}>
            <PostListPage
                initialPosts={posts || []}
                totalPosts={totalPosts || 0}
                totalPages={totalPages}
                currentPage={page}
                currentSearch={searchQuery}
                config={config} // ¡Configuración 100% dinámica!
                pageTitle={pageTitle}
                pageDescription={pageDescription}
            />
        </Suspense>
    );
}