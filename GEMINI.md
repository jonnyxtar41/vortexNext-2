# Proyecto: vortexNext-2

Este documento proporciona un resumen completo del proyecto "vortexNext-2", la versión en Next.js del proyecto "Zona Vortex" originalmente construido con Vite. El objetivo es migrar la aplicación página por página, aprovechando las características de Next.js como el App Router y los Server Components.

## 1. Resumen del Proyecto

- **Nombre:** vortexNext-2
- **Tecnologías Principales:** Next.js, React, Tailwind CSS, Supabase.
- **Objetivo:** Migrar la aplicación web "Zona Vortex" a Next.js. La aplicación consiste en una parte pública para visualizar artículos (recursos) y un panel de administración privado para gestionar contenido, usuarios, anuncios y la apariencia del sitio.

## 2. Estructura y Tecnologías (Versión Next.js)

- **Framework Frontend:** Next.js con React (utilizando el **App Router**).
- **Estilos:** Tailwind CSS. Los componentes de UI se encuentran en `app/components/ui`, sugiriendo el uso de `shadcn/ui`.
- **Routing:** `next/navigation` y el sistema de enrutamiento basado en archivos del App Router. Se utilizan grupos de rutas como `(public)` para organizar las secciones de la aplicación.
- **Backend y Base de Datos:** Supabase (BaaS) para la autenticación y toda la gestión de la base de datos. La configuración del cliente de Supabase y las funciones de acceso a datos se encuentran en `app/lib/`.
- **Renderizado:** Se aprovecha el modelo de componentes de React Server Components (RSC) y Client Components. Los componentes de servidor se usan para el fetching de datos (`app/(public)/[...slug]/page.jsx`) y los componentes de cliente para la interactividad (`app/components/PostListPage.jsx`).

## 3. Estructura de Carpetas Clave (App Router)

- **`app/`**: Directorio principal del App Router.
  - **`layout.jsx`**: Layout raíz de la aplicación.
  - **`(public)/`**: Grupo de rutas para las páginas públicas.
    - **`layout.jsx`**: Layout específico para las rutas públicas.
    - **`page.jsx`**: Página de inicio (Home).
    - **`[...slug]/page.jsx`**: Ruta dinámica para mostrar páginas o posts, probablemente renderizada en el servidor.
    - **`post/[slug]/page.jsx`**: Página para mostrar un post individual.
  - **`control-panel-7d8a2b3c4f5e/`**: Grupo de rutas para el panel de administración privado.
  - **`components/`**: Componentes reutilizables de la aplicación.
  - **`lib/`**: Módulos de utilidad, incluyendo la interacción con Supabase.

## 4. Flujo de Datos y Autenticación

- **Cliente Supabase:** La inicialización y configuración del cliente de Supabase se maneja en `app/lib/customSupabaseClient.js`.
- **Operaciones a BD:** Las funciones para interactuar con la base de datos (posts, categorías, etc.) están modularizadas en `app/lib/supabase/`. Se ha implementado una estricta separación entre funciones de servidor y de cliente, detallada en la sección de Refactorización de Acceso a Datos.
- **Autenticación:** El estado de la autenticación se gestiona a través de un contexto (`app/contexts/SupabaseAuthContext.jsx`) que se provee en `app/providers.jsx`, disponible para los Client Components que lo necesiten.

## 5. Migración y Puntos Clave

- **De SPA a Next.js:** La migración implica pasar de un modelo de Single Page Application (SPA) con `react-router-dom` a la arquitectura de Next.js, que renderiza en el servidor por defecto.
- **Fetching de Datos:** Las llamadas para obtener datos que antes se hacían en `useEffect` en el cliente, ahora se realizan directamente en los Server Components para mejorar el rendimiento y el SEO.
- **Componentes de Cliente y Servidor:** Se sigue la convención de Next.js: los componentes son Server Components por defecto. Se utiliza la directiva `"use client"` en los componentes que requieren interactividad (hooks, manejo de estado, eventos).

## 6. Refactorización de Acceso a Datos (Next.js Best Practices)

Para resolver los errores de hidratación (`Module not found: Can't resolve 'net'`) y asegurar una arquitectura robusta, se ha implementado una estricta separación de responsabilidades para las funciones de Supabase:

-   **`app/lib/supabase/posts.js`**: Este módulo es **exclusivo del servidor**. Contiene únicamente funciones que tienen dependencias del lado del servidor, como la sanitización de HTML con `jsdom` y `dompurify` (ej. `addPost`, `updatePost`). **Ningún Client Component debe importar directamente desde este archivo.**
-   **`app/lib/supabase/client.js`**: Este módulo es el **punto central para todas las operaciones de datos seguras para el cliente**. Contiene todas las funciones de fetching y manipulación de datos que pueden ejecutarse tanto en Client Components como en Server Components sin introducir dependencias de servidor en el bundle del cliente (ej. `getPosts`, `getPostBySlug`, `deletePost`, `getFeaturedPosts`, `getDownloadablePosts`, etc.).
-   **`app/actions/posts.js`**: Este módulo contiene **Server Actions (`'use server'`)**. Actúa como un puente seguro, permitiendo que los Client Components invoquen lógica exclusiva del servidor (como `updatePostAction` o `approveAndPublishEdit`) sin importar directamente el código del servidor.

Esta arquitectura garantiza que los Client Components solo reciban código que puedan ejecutar en el navegador, mientras que la lógica sensible o con dependencias de servidor se mantiene estrictamente en el entorno del servidor.

## 7. Scripts Disponibles

- **`npm run dev`**: Inicia el servidor de desarrollo de Next.js.
- **`npm run build`**: Genera la versión de producción de la aplicación.
- **`npm run start`**: Inicia el servidor de producción de Next.js.
- **`npm run lint`**: Ejecuta el linter de Next.js (ESLint).
