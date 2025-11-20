# 🚀 Zona Vortex Migración (Next.js App Router)

Este es el repositorio principal para el proyecto **Zona Vortex**, migrado de un entorno basado en Vite a la arquitectura moderna de **Next.js 14+ (App Router)**.

El objetivo principal de esta migración es maximizar el SEO, el rendimiento y la escalabilidad mediante el uso de Server Components, Generación Estática Incremental (ISR) y rutas dinámicas avanzadas.

## 🛠️ Stack Tecnológico

* **Framework:** Next.js (App Router)
* **Lenguaje:** JavaScript / React
* **Estilos:** Tailwind CSS
* **Base de Datos/Backend:** Supabase (Auth, DB, Storage)

## ✨ Características Principales

* **Rutas Dinámicas:** Manejo de taxonomías flexibles (Sección, Categoría, Subcategoría) con rutas de captura (`[...slug]/page.jsx`).
* **Máximo Rendimiento (Server Components):** Uso extensivo de Server Components para pre-renderizar la mayor parte de la UI en el servidor.
* **SEO Óptimo (On-Demand ISR):** Los posts se generan estáticamente en el primer acceso y se mantienen en caché indefinidamente hasta que se revalidan manualmente.
* **Generación Estática en Build:** Implementación de `generateStaticParams` para pre-generar los posts más recientes en el momento del despliegue.
* **Ruta de Administración Obfuscada:** La ruta del panel de control está protegida por una URL oculta y dinámica.

## ⚙️ Configuración del Proyecto

### 1. Prerequisitos

* Node.js (ver `.nvmrc`)
* Supabase CLI (para desarrollo local, si aplica)

### 2. Instalación

```bash
git clone [URL_DE_TU_REPOSITORIO]
cd vortexnext-2
npm install