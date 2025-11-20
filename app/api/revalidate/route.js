import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';

/**
 * Endpoint para revalidar el caché de una ruta (Post) específica.
 *
 * Ejemplo de uso (desde el CMS o un webhook de Supabase):
 * [TU_DOMINIO]/api/revalidate?secret=MI_TOKEN_SECRETO&slug=nombre-del-post
 */
export async function GET(request) {
  // 1. Obtener los parámetros de búsqueda (secret y slug)
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug');
  const secret = searchParams.get('secret');

  // 2. Validar el token secreto por seguridad
  // Asegúrate de definir MY_SECRET_TOKEN en tus variables de entorno (.env)
  if (secret !== process.env.MY_SECRET_TOKEN) {
    return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
  }

  // 3. Validar que el slug fue proporcionado
  if (!slug) {
    return NextResponse.json({ message: 'Missing slug parameter' }, { status: 400 });
  }

  try {
    // 4. Ejecutar la revalidación. 
    // La ruta es dinámica y sigue el patrón de tu archivo de post: /post/[slug]
    revalidatePath(`/post/${slug}`);

    // También puedes revalidar el inicio o alguna página de listado si fuera necesario
    // revalidatePath('/'); 

    return NextResponse.json({ 
        revalidated: true, 
        message: `Ruta /post/${slug} revalidada exitosamente.`,
        timestamp: Date.now() 
    });

  } catch (err) {
    // Si la revalidación falla (ej: error interno de Next.js), devuelve un 500
    console.error('Error durante la revalidación:', err);
    return NextResponse.json({ message: 'Error revalidating', error: err.message }, { status: 500 });
  }
}

// Puedes añadir una función POST si prefieres enviar el secreto y el slug en el cuerpo (body) 
// de la petición, lo cual es considerado un poco más seguro.
// export async function POST(request) { /* ... lógica similar ... */ }