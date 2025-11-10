import { createClient } from '@supabase/supabase-js';

// Las variables ahora se cargan desde el archivo .env
const supabaseUrl = (import.meta.env && import.meta.env.VITE_SUPABASE_URL) || process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = (import.meta.env && import.meta.env.VITE_SUPABASE_ANON_KEY) || process.env.VITE_SUPABASE_ANON_KEY;

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