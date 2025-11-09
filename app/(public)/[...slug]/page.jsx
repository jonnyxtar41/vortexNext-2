// app/(public)/[...slug]/page.jsx

import { getPosts } from '@/app/lib/supabase/posts';
import PostListPage from '@/app/components/PostListPage';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
// Importamos el cliente de Supabase para hacer consultas de taxonomía
import { supabase } from '@/app/lib/customSupabaseClient'; 

const POSTS_PER_PAGE = 9;

/**
 * --- Lógica de Taxonomía Dinámica ---
 * Estas son las funciones que faltaban.
 * Consultan la BD para obtener los detalles de la sección, categoría y subcategoría
 * basándose en los slugs de la URL.
 */
async function getTaxonomyData(slugArray) {
    const [sectionSlug, categorySlug, subcategorySlug] = slugArray;

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
    
    const slugArray = params.slug || [];
    
    // --- ¡NUEVA VALIDACIÓN! ---
    // Evita que esta ruta dinámica capture rutas reservadas de la aplicación.
    const RESERVED_PATHS = ['admin', 'control-panel-7d8a2b3c4f5e', 'login', 'register', 'auth', 'edit-post', 'forgot-password', 'update-password'];
    if (RESERVED_PATHS.includes(slugArray[0])) {
        notFound();
    }

    // --- 1. Obtener datos de Taxonomía ---
    const taxData = await getTaxonomyData(slugArray);

    // Si la taxonomía no es válida (ej: /weki-vortex), mostramos 404
    if (!taxData) {
        notFound();
    }

    const { section, category, subcategory, pageTitle, pageDescription, config } = taxData;

    // --- 2. Búsqueda y Paginación ---
    const page = parseInt(searchParams.page || '1', 10);
    const searchQuery = searchParams.q || '';

    // --- INICIO DEBUG 1 ---
    console.log(`\n[DEBUG page.jsx] Llamando a getPosts con:`, {
        section: section.slug,
        categoryName: category?.slug,
        subcategoryName: subcategory?.slug,
        searchQuery: searchQuery,
        page: page,
    });
    // --- FIN DEBUG 1 ---

    // --- 3. Carga de Posts (en el servidor) ---
    // Usamos los *slugs* para pasarlos a getPosts,
    // que ya sabe cómo filtrar por slug
    const { data: posts, count: totalPosts } = await getPosts({
        section: section.slug,
        categoryName: category?.name,
        subcategoryName: subcategory?.name,
        searchQuery: searchQuery,
        page: page,
        limit: POSTS_PER_PAGE,
    });

   



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