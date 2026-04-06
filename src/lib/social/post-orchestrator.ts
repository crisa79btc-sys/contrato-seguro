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

/**
 * Executa o ciclo completo de geração e publicação.
 * Chamado pelo Vercel Cron diariamente.
 */
export async function runSocialPost(options?: {
  dryRun?: boolean;
}): Promise<OrchestratorResult> {
  const dryRun = options?.dryRun ?? false;

  // 1. Verificar se já postou hoje
  if (!dryRun) {
    const alreadyPosted = await hasPostedToday();
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

  // 5. Construir URL da imagem
  const imageId = `${topic.key}-${Date.now()}`;
  const imageUrl = `${APP_URL}/api/social/image/${encodeURIComponent(imageId)}?headline=${encodeURIComponent(post.imageHeadline)}&category=${encodeURIComponent(topic.category)}`;

  // 6. Montar texto completo com hashtags
  const fullCaption = `${post.text}\n\n${post.hashtags.join(' ')}`;

  if (dryRun) {
    console.log('[Social] DRY RUN — não publicando.');
    console.log('[Social] Texto:', fullCaption);
    console.log('[Social] Imagem:', imageUrl);
    return { success: true, topicKey: topic.key };
  }

  // 7. Publicar no Facebook
  let fbResult: MetaPostResult | undefined;
  if (configured.facebook) {
    console.log('[Social] Publicando no Facebook...');
    fbResult = await postToFacebook({
      message: fullCaption,
      imageUrl,
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

  // 9. Registrar no estado
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

  const anySuccess = (fbResult?.success ?? false) || (igResult?.success ?? false);

  return {
    success: anySuccess,
    topicKey: topic.key,
    facebook: fbResult,
    instagram: igResult,
  };
}
