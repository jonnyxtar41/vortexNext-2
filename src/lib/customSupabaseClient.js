import { createClient } from '@supabase/supabase-js';

// Las variables ahora se cargan desde el archivo .env
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, 
  typeof sessionStorage !== 'undefined' 
    ? {
        auth: {
          storage: sessionStorage,
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true
        },
      }
    : {}
);