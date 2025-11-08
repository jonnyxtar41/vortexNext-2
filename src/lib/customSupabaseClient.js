// src/lib/customSupabaseClient.js

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey,
  typeof sessionStorage !== 'undefined'
    ? {
        // --- Opciones del Lado del Cliente ---
        auth: {
          storage: sessionStorage,
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true
        },
      }
    : {
        // --- Opciones del Lado del Servidor ---
        auth: {
          autoRefreshToken: false,
          persistSession: false, // <--- LA SOLUCIÓN
          detectSessionInUrl: false
        }
      }
);