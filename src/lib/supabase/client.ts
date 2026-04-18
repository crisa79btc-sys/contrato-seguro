/**
 * Client Supabase para uso em Client Components ('use client').
 * Usa @supabase/ssr com createBrowserClient para manter sessão via cookies.
 *
 * IMPORTANTE: Só usar em Client Components. Para Server Components e Route
 * Handlers, usar src/lib/supabase/server.ts.
 */
'use client';

import { createBrowserClient } from '@supabase/ssr';

export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
