/**
 * Orquestrador principal do módulo de automação social.
 * Fluxo: escolher tema → gerar conteúdo → publicar em todos os canais → registrar.
 *
 * Canais suportados:
 * - Facebook (Meta Graph API) — token: META_PAGE_ACCESS_TOKEN + META_PAGE_ID
 * - Instagram (Meta Graph API) — token: META_PAGE_ACCESS_TOKEN + META_IG_USER_ID
 * - Threads (graph.threads.net) — token: META_THREADS_ACCESS_TOKEN + META_THREADS_USER_ID
 * - Telegram (Bot API) — token: TELEGRAM_BOT_TOKEN + TELEGRAM_CHANNEL_ID
 * - LinkedIn (Marketing API) — token: LINKEDIN_ACCESS_TOKEN + LINKEDIN_ORGANIZATION_ID
 * - Newsletter (Brevo) — token: BREVO_API_KEY + BREVO_LIST_ID
 */

import { pickNextTopic, TOPIC_BANK } from './topics';
import { generateSocialPost } from './content-generator';
import { postToFacebook, postToInstagram, postToThreads, isMetaConfigured } from './meta-client';
import { postToTelegram, isTelegramConfigured } from './telegram-client';
import { postToLinkedIn, isLinkedInConfigured } from './linkedin-client';
import { sendNewsletter, isBrevoConfigured, buildNewsletterHtml } from './brevo-client';
import {
  hasPostedToday,
  getPostedTopics,
  getLastCategory,
  recordPost,
  resetPostedTopics,
} from './state';
import type { OrchestratorResult, MetaPostResult, SocialPostResult } from './types';

const APP_URL = (process.env.NEXT_PUBLIC_APP_URL || 'https://contrato-seguro-inky.vercel.app').trim();

function getTemplateImageUrl(category: string): string {
  return `${APP_URL}/brand/social-templates/social-${category}.png`;
}

/**
 * Executa o ciclo completo de geração e publicação em todos os canais configurados.
 * Chamado pelo Vercel Cron diariamente às 9h BRT (12:00 UTC).
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

  // 2. Verificar se há ao menos um canal configurado
  const metaConfig = isMetaConfigured();
  const telegramOk = isTelegramConfigured();
  const linkedInOk = isLinkedInConfigured();
  const brevoOk = isBrevoConfigured();

  const anyConfigured =
    metaConfig.facebook || metaConfig.instagram || metaConfig.threads ||
    telegramOk || linkedInOk || brevoOk;

  if (!anyConfigured) {
    return { success: false, topicKey: 'none', error: 'Nenhuma rede social configurada' };
  }

  // 3. Escolher tema
  let postedTopics = await getPostedTopics();
  const lastCategory = await getLastCategory();

  if (postedTopics.length >= TOPIC_BANK.length) {
    await resetPostedTopics();
    postedTopics = [];
  }

  const topic = pickNextTopic(postedTopics, lastCategory);
  console.log(`[Social] Tema: ${topic.key} (${topic.category}/${topic.type})`);

  // 4. Gerar conteúdo
  const post = await generateSocialPost(topic);
  console.log(`[Social] Post gerado: ${post.imageHeadline}`);

  // 5. Definir imagem e caption
  const imageUrl = getTemplateImageUrl(topic.category);
  const fullCaption = `${post.text}\n\n${post.hashtags.join(' ')}`;

  if (dryRun) {
    console.log('[Social] DRY RUN — não publicando.');
    console.log('[Social] Texto:', fullCaption);
    console.log('[Social] Imagem:', imageUrl);
    return { success: true, topicKey: topic.key };
  }

  // 6. Publicar em paralelo em todos os canais configurados
  const [fbResult, igResult, threadsResult, telegramResult, linkedInResult] =
    await Promise.all([
      // Facebook — link preview
      metaConfig.facebook
        ? postToFacebook({ message: fullCaption, link: APP_URL })
        : Promise.resolve(undefined as MetaPostResult | undefined),

      // Instagram — imagem + caption
      metaConfig.instagram
        ? postToInstagram({ caption: fullCaption, imageUrl })
        : Promise.resolve(undefined as MetaPostResult | undefined),

      // Threads — texto + imagem (opcional)
      metaConfig.threads
        ? postToThreads({ text: fullCaption, imageUrl })
        : Promise.resolve(undefined as MetaPostResult | undefined),

      // Telegram — imagem + caption
      telegramOk
        ? postToTelegram({ text: fullCaption, imageUrl })
        : Promise.resolve(undefined as SocialPostResult | undefined),

      // LinkedIn — texto + link para o site
      linkedInOk
        ? postToLinkedIn({ text: fullCaption, url: APP_URL })
        : Promise.resolve(undefined as SocialPostResult | undefined),
    ]);

  // 7. Newsletter (separada — envolve geração de HTML)
  let newsletterResult: SocialPostResult | undefined;
  if (brevoOk) {
    const htmlContent = buildNewsletterHtml({
      text: post.text,
      hashtags: post.hashtags,
      imageUrl,
      appUrl: APP_URL,
    });
    newsletterResult = await sendNewsletter({
      subject: `💡 ${post.imageHeadline} — ContratoSeguro`,
      htmlContent,
    });
  }

  // 8. Log dos resultados
  if (fbResult) console.log('[Social] Facebook:', fbResult.success ? `OK (${fbResult.id})` : `ERRO: ${fbResult.error}`);
  if (igResult) console.log('[Social] Instagram:', igResult.success ? `OK (${igResult.id})` : `ERRO: ${igResult.error}`);
  if (threadsResult) console.log('[Social] Threads:', threadsResult.success ? `OK (${threadsResult.id})` : `ERRO: ${threadsResult.error}`);
  if (telegramResult) console.log('[Social] Telegram:', telegramResult.success ? `OK (${telegramResult.id})` : `ERRO: ${telegramResult.error}`);
  if (linkedInResult) console.log('[Social] LinkedIn:', linkedInResult.success ? `OK (${linkedInResult.id})` : `ERRO: ${linkedInResult.error}`);
  if (newsletterResult) console.log('[Social] Newsletter:', newsletterResult.success ? `OK (${newsletterResult.id})` : `ERRO: ${newsletterResult.error}`);

  const anySuccess =
    (fbResult?.success ?? false) ||
    (igResult?.success ?? false) ||
    (threadsResult?.success ?? false) ||
    (telegramResult?.success ?? false) ||
    (linkedInResult?.success ?? false) ||
    (newsletterResult?.success ?? false);

  // 9. Registrar no estado
  if (anySuccess) {
    const today = new Date().toISOString().split('T')[0];
    await recordPost({
      date: today,
      topicKey: topic.key,
      fbPostId: fbResult?.success ? fbResult.id : undefined,
      igPostId: igResult?.success ? igResult.id : undefined,
    });
  } else {
    console.error('[Social] Nenhum canal publicou com sucesso — estado NÃO registrado para permitir retry.');
  }

  return {
    success: anySuccess,
    topicKey: topic.key,
    facebook: fbResult,
    instagram: igResult,
    threads: threadsResult,
    telegram: telegramResult,
    linkedin: linkedInResult,
    newsletter: newsletterResult,
  };
}
