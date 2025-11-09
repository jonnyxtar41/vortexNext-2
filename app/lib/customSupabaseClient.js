// app/lib/customSupabaseClient.js


// 1. Importa el NUEVO "ayudante" de cliente
//    (Este es el archivo que creamos en el Paso 1 de mi respuesta anterior)
import { createClient } from '@/app/utils/supabase/client';

// 2. Crea y exporta la instancia del cliente.
//    Esta función ahora usa 'createBrowserClient' de @supabase/ssr
//    internamente, lo cual es seguro para el navegador.
export const supabase = createClient();