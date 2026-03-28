import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let publicClient: SupabaseClient | null = null;
let adminClient: SupabaseClient | null = null;

/**
 * Client público (browser) — respeita RLS.
 * Lazy: só lança erro quando chamado, não no import.
 */
export function getSupabaseClient(): SupabaseClient {
  if (!publicClient) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) {
      throw new Error(
        'Supabase não configurado. Configure NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY no .env.local'
      );
    }
    publicClient = createClient(url, key);
  }
  return publicClient;
}

/**
 * Client admin (server only) — bypassa RLS.
 * Lazy: só lança erro quando chamado.
 */
export function getAdminClient(): SupabaseClient {
  if (!adminClient) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !serviceKey) {
      throw new Error(
        'Supabase admin não configurado. Configure SUPABASE_SERVICE_ROLE_KEY no .env.local'
      );
    }
    adminClient = createClient(url, serviceKey);
  }
  return adminClient;
}
