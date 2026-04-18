/**
 * Helpers de autenticação — uso server-side.
 *
 * getCurrentUser(): retorna o usuário logado ou null.
 * Usado em Route Handlers para associar contratos ao user_id
 * e verificar permissões.
 */
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { User } from '@supabase/supabase-js';

/**
 * Retorna o usuário autenticado a partir da sessão no cookie, ou null se
 * não logado. Não lança exceção — tratar o retorno null como "anônimo".
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const supabase = createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user ?? null;
  } catch {
    // Supabase não configurado ou cookie inválido — tratar como anônimo
    return null;
  }
}
