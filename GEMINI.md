# 🚀 PROYECTO VORTEXNEXT: CONTEXTO Y FUNCIONALIDADES DETALLADAS

Este documento proporciona una descripción completa del proyecto VortexNext, un sistema de gestión de contenido (CMS) y plataforma de recursos educativos migrado de Vite a **Next.js 14 (App Router)**.

## 🛠️ STACK TECNOLÓGICO CENTRAL

* **Framework:** Next.js (App Router).
* **Base de Datos y Backend as a Service (BaaS):** Supabase (incluyendo Auth, Database, Storage, y Edge Functions).
* **Estilos:** Tailwind CSS, con componentes UI basados en shadcn/ui.
* **Animaciones:** Framer Motion (utilizado en componentes públicos como `Blog.jsx` y `RecentPosts.jsx`).
* **Editor de Contenido:** Tiptap (Rich Text Editor).

## ✨ MÓDULOS Y FUNCIONALIDADES CLAVE

### 1. Sistema de Contenido Público (SEO y Rendimiento)

| Módulo | Ruta y Archivo Principal | Descripción Detallada |
| :--- | :--- | :--- |
| **Página de Post** | `app/(public)/post/[slug]/page.jsx`/page.jsx] | Muestra posts individuales. Implementa **ISR** (`revalidate = 3600`) para eficiencia/page.jsx] y generación dinámica de **Metadata y JSON-LD** (Schema.org) para SEO/page.jsx]. Maneja lógica de posts relacionados y recomendados. |
| **Listados / Recursos** | `app/(public)/[...slug]/page.jsx`/page.jsx] | Ruta catch-all para manejar listados de posts por secciones o categorías. Utiliza el componente `PostListPage.jsx` para mostrar la lista y la paginación. |
| **Material Descargable** | `app/components/Downloads.jsx` | Muestra posts marcados como descargables. Utiliza `DownloadModal.jsx` para gestionar el flujo de descarga. |

### 2. Autenticación y Administración de Usuarios

* **Rutas de Acceso:** Incluye rutas dedicadas para **Login** (`/login/page.jsx`), **Registro** (`/register/page.jsx`), **Restablecimiento de Contraseña** y un *callback* de autenticación de Supabase.
* **Contexto de Autenticación:** El estado de autenticación se gestiona a través de un Contexto de Supabase (`SupabaseAuthContext.jsx`).

### 3. Panel de Control de Administración (Control Panel)

El panel de administración está protegido bajo una ruta ofuscada (escondida) `/control-panel-7d8a2b3c4f5e/` y contiene los siguientes módulos:

| Módulo | Archivo Principal | Funcionalidades |
| :--- | :--- | :--- |
| **Gestión de Posts** | `app/components/admin/PostForm.jsx` | Creación y edición de contenido con el editor Tiptap. Incluye campos para SEO, keywords, imágenes y estado del post (`published`, `draft`, `pending_approval`, `scheduled`). |
| **Listados de Posts** | `app/components/admin/ManagePostsList.jsx` | Listado principal de posts. Módulo separado para posts pendientes de revisión (`ManagePendingPosts.jsx`). |
| **Taxonomía** | `ManageCategories.jsx`, `ManageSections.jsx`, `ManageSubcategories.jsx` | Gestión completa de secciones, categorías y subcategorías para la organización del contenido. |
| **Configuración General** | `manage-site-content/page.jsx` | Módulo para editar contenido estático, políticas y otros textos del sitio. |
| **Otros Módulos** | `/analytics`, `/payments`, `/manage-ads`, `/manage-users` | Incluye gestión de logs, analíticas, pagos (donaciones), publicidad y usuarios. |

### 4. Pagos y Monetización

* **Donaciones/Pagos:** Existe una ruta dedicada a donaciones con integración a una pasarela de pago (menciona un *callback* de **PayPhone** en `app/(public)/payphone/callback/page.jsx`).
* **Gestión de Pagos:** El panel de control incluye un módulo para listar y gestionar los registros de pagos.

### 5. Utilidades y Servicios

* **Revalidación bajo Demanda (ISR):** Ruta de API crítica para actualizar el caché de Next.js (`/api/revalidate/route.js`). Requiere la variable de entorno **`REVALIDATION_SECRET`** para funcionar de forma segura.
* **Generación de Sitemap:** El proyecto incluye un script (`tools/generate-sitemap.js`) para generar dinámicamente el archivo `sitemap.xml`.
* **Limpieza de Imágenes:** Hay una función de Edge Functions de Supabase (`supabase/functions/cleanup-orphan-images/index.ts`) para mantener el Storage limpio.

---