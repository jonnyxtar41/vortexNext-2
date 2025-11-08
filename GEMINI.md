# Proyecto: Zona Vortex

Este documento proporciona un resumen completo del proyecto "Zona Vortex", una aplicación web construida con React y Supabase.

## 1. Resumen del Proyecto

- **Nombre:** Zona Vortex
- **Tecnologías Principales:** React, Vite, Tailwind CSS, Supabase.
- **Objetivo:** Es una aplicación web con una parte pública para visualizar artículos (recursos) y un panel de administración privado para gestionar todo el contenido, usuarios, anuncios y apariencia del sitio.

## 2. Estructura y Tecnologías

- **Framework Frontend:** React
- **Build Tool:** Vite.js
- **Estilos:** Tailwind CSS, utilizando componentes de `shadcn/ui` y `radix-ui`.
- **Routing:** `react-router-dom` para la navegación en esta Single Page Application (SPA).
- **Backend y Base de Datos:** Supabase (BaaS) se utiliza para la autenticación y toda la gestión de la base de datos.
- **Editor de Texto:** El editor de texto enriquecido para crear/editar posts es `Tiptap`. Se ha configurado para permitir la aplicación de colores de fondo individuales a las celdas de las tablas.

## 3. Flujo de Datos y Autenticación

- **Cliente Supabase:** La conexión con Supabase se inicializa en `lib/customSupabaseClient.js`.
- **Operaciones a BD:** Las funciones para interactuar con la base de datos (posts, categorías, etc.) están en `lib/supabase/`.
- **Autenticación:** El estado de la autenticación se maneja globalmente a través de `contexts/SupabaseAuthContext.jsx`. Este contexto provee el estado del usuario (`user`, `session`) y las funciones para `signIn`, `signUp` y `signOut`.

## 4. Componentes Clave

### Ficheros Principales
- **`main.jsx`**: Punto de entrada. Renderiza la aplicación y provee los contextos principales.
- **`App.jsx`**: Define todas las rutas de la aplicación (públicas, de autenticación y privadas).
- **`index.css`**: Hoja de estilos global con la configuración base de Tailwind CSS.

### Contextos (State Management)
- **`SupabaseAuthContext.jsx`**: Gestiona la sesión del usuario. Esencial para las rutas privadas.
- **`ThemeContext.jsx`**: Gestiona el tema visual (claro/oscuro) de la aplicación.
- **`LayoutContext.jsx`**: Controla el estado de elementos del layout, como el panel lateral.

### Manejo de Rutas Dinámicas y Carga Inicial

- **`App.jsx`**: Para evitar redirecciones inesperadas a la página de inicio al recargar la página o al acceder a rutas dinámicas (como las de los posts), el componente `App` ahora envuelve todas las `Routes` públicas en una comprobación condicional basada en el estado `isLoading`. Esto asegura que las rutas dinámicas (que dependen de la carga asíncrona de las secciones) solo se rendericen una vez que los datos iniciales estén disponibles. Mientras los datos se cargan, se muestra un `LoadingFallback`. Este comportamiento previene una condición de carrera donde el enrutador intentaría hacer coincidir rutas con definiciones incompletas, lo que resultaría en una redirección al comodín (`<Route path="*" element={<Navigate to="/" />} />`).

### Panel de Administración (`/control-panel-7d8a2b3c4f5e`)
- **`pages/Admin.jsx`**: Dashboard principal del panel de administración, que usa pestañas para navegar entre las diferentes secciones.
- **`PostForm.jsx`**: Formulario para crear y editar recursos.
- **`ManageContent.jsx`**: Muestra y permite gestionar los posts y categorías existentes.
- **Otras secciones:** `ManageAds`, `Analytics`, `ManageTheme`, etc.

## 5. Scripts Disponibles

- **`npm run dev`**: Inicia el servidor de desarrollo con Vite.
- **`npm run build`**: Genera la versión de producción de la aplicación en la carpeta `dist/`.
- **`npm run preview`**: Sirve la carpeta `dist/` para previsualizar el build de producción.

## 6. Despliegue

- La aplicación es una SPA, por lo que requiere que el servidor web esté configurado para redirigir todas las peticiones a `index.html`.
- El archivo `public/.htaccess` contiene la configuración necesaria para servidores Apache, solucionando el problema de recarga de página en rutas anidadas.

## 7. Sistema de SuperAdmin

Se ha implementado un sistema para designar a un único "SuperAdmin" con capacidades extendidas (ej. borrado de logs de actividad) y la habilidad de transferir su rol.

### Base de Datos

1.  **Tabla `super_admin_config`**
    - Se utiliza para almacenar el `user_id` del SuperAdmin actual.
    - **RLS (Row Level Security)** está activada y sin políticas, bloqueando todo acceso directo desde el frontend.

    **Estructura:**
    - `id` (int8, Primary Key)
    - `user_id` (uuid, Foreign Key a `auth.users.id`)

2.  **Función SQL `is_super_admin()`**
    - Devuelve `true` si el usuario autenticado es el SuperAdmin, y `false` en caso contrario.
    - Se utiliza en el `SupabaseAuthContext` para determinar el estatus del usuario.

    ```sql
    CREATE OR REPLACE FUNCTION is_super_admin()
    RETURNS boolean
    LANGUAGE sql
    VOLATILE
    SECURITY DEFINER
    AS $$
      SELECT auth.uid() = (SELECT user_id FROM public.super_admin_config WHERE id = 1);
    $$;
    ```

3.  **Función SQL `transfer_super_admin()`**
    - Permite al SuperAdmin actual transferir su rol a otro usuario.
    - Verifica que quien llama a la función es el SuperAdmin actual antes de realizar la actualización.
    - Se llama desde la interfaz en la página de "Gestionar Usuarios".

    ```sql
    CREATE OR REPLACE FUNCTION transfer_super_admin(new_admin_id uuid)
    RETURNS uuid
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $$
    DECLARE
      updated_id uuid;
    BEGIN
      -- Verification
      IF auth.uid() != (SELECT user_id FROM public.super_admin_config WHERE id = 1) THEN
        RAISE EXCEPTION 'No tienes permiso para realizar esta acción. Solo el SuperAdmin actual puede transferir el rol.';
      END IF;

      -- Update
      UPDATE public.super_admin_config
      SET user_id = new_admin_id
      WHERE id = 1;

      -- Verify the update and return the new ID
      SELECT user_id INTO updated_id FROM public.super_admin_config WHERE id = 1;
      RETURN updated_id;
    END;
    $$;
    ```

### Frontend

- **`SupabaseAuthContext.jsx`**: Llama a `is_super_admin()` al iniciar la sesión para establecer un estado global `isSuperAdmin`.
- **`Admin.jsx`**: Muestra una insignia de "SuperAdmin" en la barra lateral si `isSuperAdmin` es `true`.
- **`ActivityLog.jsx`**: Muestra los botones para borrar registros si `isSuperAdmin` es `true`.
- **`ManageUsers.jsx`**: Muestra el botón para transferir el rol si `isSuperAdmin` es `true`.