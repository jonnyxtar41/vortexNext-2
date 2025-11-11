# vortexNext-2

This is the Next.js version of the "Zona Vortex" project, originally built with Vite. The goal of this project is to migrate the application page by page, taking advantage of Next.js features like the App Router and Server Components.

## Project Overview

- **Name:** vortexNext-2
- **Main Technologies:** Next.js, React, Tailwind CSS, Supabase.
- **Objective:** To migrate the "Zona Vortex" web application to Next.js. The application consists of a public part to display articles (resources) and a private administration panel to manage content, users, ads, and the appearance of the site.

## Structure and Technologies (Next.js Version)

- **Frontend Framework:** Next.js with React (using the **App Router**).
- **Styling:** Tailwind CSS. The UI components are located in `app/components/ui`, suggesting the use of `shadcn/ui`.
- **Routing:** `next/navigation` and the file-based routing system of the App Router. Route groups like `(public)` are used to organize the application's sections.
- **Backend and Database:** Supabase (BaaS) for authentication and all database management. The Supabase client configuration and data access functions are located in `app/lib/`.
- **Rendering:** The React Server Components (RSC) and Client Components model is leveraged. Server components are used for data fetching (`app/(public)/[...slug]/page.jsx`) and client components for interactivity (`app/components/PostListPage.jsx`).

## Key Folder Structure (App Router)

- **`app/`**: Main directory of the App Router.
  - **`layout.jsx`**: Root layout of the application.
  - **`(public)/`**: Route group for public pages.
    - **`layout.jsx`**: Specific layout for public routes.
    - **`page.jsx`**: Home page.
    - **`[...slug]/page.jsx`**: Dynamic route to display pages or posts, probably rendered on the server.
    - **`post/[slug]/page.jsx`**: Page to display an individual post.
  - **`control-panel-7d8a2b3c4f5e/`**: Route group for the private administration panel.
  - **`components/`**: Reusable application components.
  - **`lib/`**: Utility modules, including interaction with Supabase.

## Data Flow and Authentication

- **Supabase Client:** The initialization and configuration of the Supabase client is handled in `app/utils/supabase/server.js` for the server-side and `app/utils/supabase/client.js` for the client-side.
- **DB Operations:** The functions to interact with the database (posts, categories, etc.) are modularized in `app/lib/supabase/`. A strict separation between server and client functions has been implemented, detailed in the Data Access Refactoring section.
- **Authentication:** The authentication state is managed through a context (`app/contexts/SupabaseAuthContext.jsx`) that is provided in `app/providers.jsx`, available to the Client Components that need it.

## Migration and Key Points

- **From SPA to Next.js:** The migration involves moving from a Single Page Application (SPA) model with `react-router-dom` to the Next.js architecture, which renders on the server by default.
- **Data Fetching:** The calls to get data that were previously made in `useEffect` on the client are now made directly in the Server Components to improve performance and SEO.
- **Client and Server Components:** The Next.js convention is followed: components are Server Components by default. The `"use client"` directive is used in components that require interactivity (hooks, state management, events).

## Data Access Refactoring (Next.js Best Practices)

To resolve hydration errors (`Module not found: Can't resolve 'net'`) and ensure a robust architecture, a strict separation of responsibilities for the Supabase functions has been implemented:

-   **`app/lib/actions/post-actions.js`**: This module contains **Server Actions (`'use server'`)**. It acts as a secure bridge, allowing Client Components to invoke server-only logic (like `updatePostAction` or `approveAndPublishEdit`) without directly importing the server code.
-   **`app/lib/supabase/client.js`**: This module is the **central point and single source of truth for all client-safe data operations**. It contains all the data fetching and manipulation functions that can be run in both Client Components and Server Components without introducing server dependencies into the client bundle (e.g., `getPosts`, `getPostBySlug`, `deletePost`, `getFeaturedPosts`, `getDownloadablePosts`, `getAllSiteContent`, `addPayment`, etc.).
-   **`app/lib/supabase/posts.js`**: This module is **server-only**. It contains only functions that have server-side dependencies or are not safe to expose to the client (e.g., functions that perform operations with elevated privileges or have heavy dependencies like `jsdom` and `dompurify`). **No Client Component should import directly from this file.**

This architecture ensures that Client Components only receive code that they can run in the browser, while sensitive logic or logic with server dependencies is kept strictly in the server environment.

## Available Scripts

- **`npm run dev`**: Starts the Next.js development server.
- **`npm run build`**: Generates the production version of the application.
- **`npm run start`**: Starts the Next.js production server.
- **`npm run lint`**: Runs the Next.js linter (ESLint).
