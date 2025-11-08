# vortexNext-2

Este documento deta informacion de lo que se requiera para la version NEXTJS la cual se esta migrando tomando como referencia la version vite. 
El objetivo es migrar pagina por pagina. Una vez que una pagina esta completamente funcional. pasamos a otra pagina 

Hoja de ruta:

[ ] Estructura de carpeta con rutas dinamicas, 
La carpeta "(public)" tendra las paginas publicas como el homepage, la pagina donde se ven todos los post, donaciones, pagos, la de los blogs o post

Se requiere hacer lo mismo con la paginas de administrador "(admin)" Aqui se pondran todas las paginas que usan los adminsitradores.


Esta es la estructura de carpetas:
.
├── .gitignore
├── .nvmrc
├── .version
├── GEMINI.md
├── VERSION VITE (PARA REFERENCIA)/ (Archivos de referencia)
│   ├── GEMINI.md (Contexto completo de la versión vite)
│   ├── package.json (Usado en la versión vite
│   ├── postcss.config.js
│   ├── plugins/
│   ├── public/ (Carpeta publica para servidores apache)
│   ├── src/
│   ├── supabase/ (Archivos para supabase)

│   ├── tailwind.config.js
│   ├── tools/
│   │   ├── generate-llms.js
│   │   └── generate-sitemap.js
│   └── vite.config.js
├── app/
│   ├── (public)/                 <-- (Grupo de ruta público)
│   │   ├── [...slug]/            
│   │   │   └── page.jsx          <-- (NUEVO ARCHIVO) Server Component dinámico
│   │   │
│   │   ├── checkout/             
│   │   ├── donar/                
│   │   ├── layout.jsx             - Layout público
│   │   ├── page.jsx               - Tu Home Page
│   │   ├── payphone/             
│   │   ├── policies/             
│   │   │
│   │   ├── post/                
│   │   │   └── [slug]/
│   │   │       └── page.jsx      <-- (Página para un post individual
│   │   │
│   │   └── suggestions/          (se mantiene)
│   │   └── PublicLayoutClient.jsx  (se mantiene)
│   │
│   ├── admin/                    ( estructura de admin)
│   │   └── ...
│   │
│   ├── auth/                     
│   │   └── ...
│   │
│   ├── components/
│   │   ├── PostListPage.jsx      <-- Componente Cliente para la UI
│   │   │
│   │   ├── AdBlock.jsx           
│   │   ├── AdLink.jsx            
│   │   ├── Pagination.jsx        (será usado por PostListPage.jsx)
│   │   ├── Footer.jsx            
│   │   ├── Header.jsx            
│   │   ├── ... (todos tus otros componentes)
│   │   └── ui/
│   │       ├── button.jsx       
│   │       ├── input.jsx         
│   │       └── ... (todos los componentes UI)
│   │
│   ├── context/                 
│   ├── contexts/                
│   ├── edit-post/                
│   │
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── posts.js          
│   │   │   ├── sections.js     
│   │   │   ├── categories.js     
│   │   │   ├── subcategories.js  )
│   │   │   └── ... (todos tus otros archivos de supabase)
│   │   └── ... (todos tus otros archivos de lib)
│   │
│   ├── login/                   
│   ├── register/                
│   ├── update-password/          
│   ├── favicon.svg              
│   ├── globals.css              
│   ├── index.css               
│   ├── layout.jsx                - Layout Raíz)
│   └── providers.jsx             
│
├── index.html                    
├── jsconfig.json                
├── next.config.mjs             
├── package-lock.json            
├── package.json               
├── postcss.config.cjs           
├── public/                    
│   └── ...
├── supabase/                   
│   └── ...
├── tailwind.config.cjs          
└── tools/                       
    ├── generate-llms.js
    ├── generate-sitemap.js
    └── temp_find_post.js