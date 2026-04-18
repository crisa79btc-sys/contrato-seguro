import { getAdminClient } from '@/lib/db/supabase';

let cache: { value: number; expiresAt: number } | null = null;

export async function getTotalContractsAnalyzed(): Promise<number> {
  if (cache && cache.expiresAt > Date.now()) return cache.value;
  try {
    const admin = getAdminClient();
    const { count } = await admin
      .from('contracts')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'analyzed');
    const value = count ?? 0;
    cache = { value, expiresAt: Date.now() + 10 * 60 * 1000 };
    return value;
  } catch {
    return 0;
  }
}
