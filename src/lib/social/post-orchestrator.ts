/**
 * Orquestrador principal do módulo de automação social.
 * Fluxo: escolher tema → gerar conteúdo → gerar imagem → publicar → registrar.
 */

import { pickNextTopic, TOPIC_BANK } from './topics';
import { generateSocialPost } from './content-generator';
import { postToFacebook, postToInstagram, isMetaConfigured } from './meta-client';
import {
  hasPostedToday,
  getPostedTopics,
  getLastCategory,
  recordPost,
  resetPostedTopics,
} from './state';
import type { OrchestratorResult, MetaPostResult } from './types';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://contrato-seguro-inky.vercel.app';
function getTemplateImageUrl(category: string): string {
  return `${APP_URL}/brand/social-templates/social-${category}.png`;
}

const CATEGORY_LABELS: Record<string, string> = {
  aluguel: 'Contrato de Aluguel',
  trabalho: 'Contrato de Trabalho',
  servico: 'Prestação de Serviço',
  compra_venda: 'Compra e Venda',
  consumidor: 'Direito do Consumidor',
  digital: 'Contratos Digitais',
  geral: 'Dica Jurídica',
};

const CATEGORY_EMOJIS: Record<string, string> = {
  aluguel: '🏠',
  trabalho: '💼',
  servico: '🔧',
  compra_venda: '🚗',
  consumidor: '🛒',
  digital: '💻',
  geral: '📋',
};

/**
 * Executa o ciclo completo de geração e publicação.
 * Chamado pelo Vercel Cron diariamente.
 */
export async function runSocialPost(options?: {
  dryRun?: boolean;
  force?: boolean;
}): Promise<OrchestratorResult> {
  const dryRun = options?.dryRun ?? false;
  const force = options?.force ?? false;

  // 1. Verificar se já postou hoje
  if (!dryRun && !force) {
    const alreadyPosted = await hasPostedToday();
    console.log(`[Social] hasPostedToday=${alreadyPosted}`);
    if (alreadyPosted) {
      console.log('[Social] Já postou hoje, pulando.');
      return { success: true, topicKey: 'skipped', error: 'Já postou hoje' };
    }
  }

  // 2. Verificar credenciais
  const configured = isMetaConfigured();
  if (!configured.facebook && !configured.instagram) {
    return { success: false, topicKey: 'none', error: 'Nenhuma rede social configurada' };
  }

  // 3. Escolher tema
  let postedTopics = await getPostedTopics();
  const lastCategory = await getLastCategory();

  // Se todos os temas foram postados, resetar
  if (postedTopics.length >= TOPIC_BANK.length) {
    await resetPostedTopics();
    postedTopics = [];
  }

  const topic = pickNextTopic(postedTopics, lastCategory);
  console.log(`[Social] Tema escolhido: ${topic.key} (${topic.category}/${topic.type})`);

  // 4. Gerar conteúdo
  const post = await generateSocialPost(topic);
  console.log(`[Social] Post gerado: ${post.imageHeadline}`);

  // 5. Definir URL da imagem (template por categoria no Supabase Storage)
  // Templates pré-gerados garantem que Instagram sempre receba imagem válida
  const imageUrl = getTemplateImageUrl(topic.category);
  console.log('[Social] Imagem template:', imageUrl);

  // 6. Montar texto completo com hashtags
  const fullCaption = `${post.text}\n\n${post.hashtags.join(' ')}`;

  if (dryRun) {
    console.log('[Social] DRY RUN — não publicando.');
    console.log('[Social] Texto:', fullCaption);
    console.log('[Social] Imagem:', imageUrl);
    return { success: true, topicKey: topic.key };
  }

  // 7. Publicar no Facebook
  // Estratégia: postar como link preview (Facebook busca a OG image do site automaticamente).
  // Evita o problema de Facebook tentar buscar imagem de URL com parâmetros longos.
  let fbResult: MetaPostResult | undefined;
  if (configured.facebook) {
    console.log('[Social] Publicando no Facebook...');
    fbResult = await postToFacebook({
      message: fullCaption,
      link: APP_URL,
    });
    console.log('[Social] Facebook:', fbResult.success ? `OK (${fbResult.id})` : `ERRO: ${fbResult.error}`);
  }

  // 8. Publicar no Instagram
  let igResult: MetaPostResult | undefined;
  if (configured.instagram) {
    console.log('[Social] Publicando no Instagram...');
    igResult = await postToInstagram({
      caption: fullCaption,
      imageUrl,
    });
    console.log('[Social] Instagram:', igResult.success ? `OK (${igResult.id})` : `ERRO: ${igResult.error}`);
  }

  const anySuccess = (fbResult?.success ?? false) || (igResult?.success ?? false);

  // 9. Registrar no estado apenas se ao menos uma publicação teve sucesso
  if (anySuccess) {
    const today = new Date().toISOString().split('T')[0];
    await recordPost({
      date: today,
      topicKey: topic.key,
      fbPostId: fbResult?.success ? fbResult.id : undefined,
      igPostId: igResult?.success ? igResult.id : undefined,
      error:
        (!fbResult?.success && fbResult?.error) || (!igResult?.success && igResult?.error)
          ? `FB: ${fbResult?.error || 'ok'} | IG: ${igResult?.error || 'ok'}`
          : undefined,
    });
  } else {
    console.error('[Social] Nenhuma rede publicou com sucesso — estado NÃO registrado para permitir retry.');
  }

  return {
    success: anySuccess,
    topicKey: topic.key,
    facebook: fbResult,
    instagram: igResult,
  };
}
