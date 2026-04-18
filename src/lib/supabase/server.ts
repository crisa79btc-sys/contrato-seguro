/**
 * Client Supabase para uso em Server Components e Route Handlers.
 * Usa @supabase/ssr para gerenciar cookies automaticamente.
 *
 * IMPORTANTE: Só usar em contextos server-side (Server Components, Route Handlers,
 * Server Actions). Para Client Components, usar src/lib/supabase/client.ts.
 */
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export function createSupabaseServerClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // setAll pode falhar em Server Components (read-only).
            // O middleware garante que a sessão seja renovada antes.
          }
        },
      },
    }
  );
}
