// utils/supabase/client.js
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
    // --- AGREGA ESTO ---
  console.log("--- DEBUGGING SUPABASE ---");
  console.log("URL leída:", process.env.NEXT_PUBLIC_SUPABASE_URL);
  console.log("KEY leída:", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 10) + "..." : "UNDEFINED");

  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
} 