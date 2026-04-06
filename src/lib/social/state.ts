/**
 * Gerenciamento de estado do módulo social via Supabase app_config.
 * Usa a tabela app_config (key-value JSONB) para persistir:
 * - Temas já postados no ciclo
 * - Histórico de posts
 * - Data do último post (proteção contra duplicatas)
 */

import { getAdminClient } from '@/lib/db/supabase';
import type { PostHistoryEntry } from './types';

const KEYS = {
  postedTopics: 'social_posted_topics',
  postHistory: 'social_post_history',
  lastPostDate: 'social_last_post_date',
  lastCategory: 'social_last_category',
} as const;

/**
 * Lê um valor do app_config.
 */
async function getState<T>(key: string): Promise<T | null> {
  try {
    const supabase = getAdminClient();
    const { data, error } = await supabase
      .from('app_config')
      .select('value')
      .eq('key', key)
      .single();

    if (error || !data) return null;
    return data.value as T;
  } catch (err) {
    console.error(`[Social] Erro ao ler estado ${key}:`, err);
    return null;
  }
}

/**
 * Salva um valor no app_config (upsert).
 */
async function setState(key: string, value: unknown, description?: string): Promise<void> {
  try {
    const supabase = getAdminClient();
    await supabase.from('app_config').upsert(
      {
        key,
        value: JSON.parse(JSON.stringify(value)),
        description: description || `Social media state: ${key}`,
      },
      { onConflict: 'key' }
    );
  } catch (err) {
    console.error(`[Social] Erro ao salvar estado ${key}:`, err);
  }
}

/**
 * Verifica se já postou hoje (proteção contra duplicatas).
 */
export async function hasPostedToday(): Promise<boolean> {
  const lastDate = await getState<string>(KEYS.lastPostDate);
  if (!lastDate) return false;
  const today = new Date().toISOString().split('T')[0];
  return lastDate === today;
}

/**
 * Retorna os temas já postados no ciclo atual.
 */
export async function getPostedTopics(): Promise<string[]> {
  return (await getState<string[]>(KEYS.postedTopics)) || [];
}

/**
 * Retorna a última categoria postada.
 */
export async function getLastCategory(): Promise<string | null> {
  return getState<string>(KEYS.lastCategory);
}

/**
 * Registra um post realizado.
 */
export async function recordPost(entry: PostHistoryEntry): Promise<void> {
  // Atualizar data do último post
  await setState(KEYS.lastPostDate, entry.date, 'Data do último post social');

  // Atualizar última categoria
  const topic = entry.topicKey?.split('-')[0] || 'geral'; // ex: "aluguel" de "aluguel-multa-rescisao"
  await setState(KEYS.lastCategory, topic, 'Última categoria postada');

  // Adicionar tema à lista de postados
  const posted = await getPostedTopics();
  posted.push(entry.topicKey);
  await setState(KEYS.postedTopics, posted, 'Temas já postados no ciclo');

  // Adicionar ao histórico (manter últimos 90)
  const history = (await getState<PostHistoryEntry[]>(KEYS.postHistory)) || [];
  history.unshift(entry);
  if (history.length > 90) history.length = 90;
  await setState(KEYS.postHistory, history, 'Histórico de posts sociais');
}

/**
 * Reseta os temas postados (quando o ciclo completo é usado).
 */
export async function resetPostedTopics(): Promise<void> {
  await setState(KEYS.postedTopics, [], 'Temas resetados — novo ciclo');
}
