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
import { generateCarouselPost } from './content-generator';
import { postToThreads, postCarouselToInstagram, postAlbumToFacebook, isMetaConfigured, postFirstComment } from './meta-client';
import { postToTelegram, isTelegramConfigured } from './telegram-client';
import { postToLinkedIn, isLinkedInConfigured } from './linkedin-client';
import { postCarouselToTikTok, isTikTokConfigured } from './tiktok-client';
import { sendNewsletter, isBrevoConfigured, buildNewsletterHtml } from './brevo-client';
import { uploadSocialImage } from './image-storage';
import {
  hasPostedToday,
  getPostedTopics,
  getLastCategory,
  getLastType,
  recordPost,
  resetPostedTopics,
  recordLastCoverUrl,
} from './state';
import type { OrchestratorResult, MetaPostResult, SocialPostResult, CarouselPost } from './types';

const APP_URL = (process.env.NEXT_PUBLIC_APP_URL || 'https://contrato-seguro-inky.vercel.app').trim();

/**
 * Gera a URL para um slide do carrossel via next/og.
 */
function buildSlideImageUrl(params: Record<string, string>): string {
  const qs = new URLSearchParams(params).toString();
  return `${APP_URL}/api/social/image/carousel?${qs}`;
}

/**
 * Busca uma imagem de slide e faz upload para Supabase.
 * Retorna a URL pública limpa para a Meta API.
 */
async function fetchAndUploadSlide(slideUrl: string, filename: string): Promise<string | null> {
  try {
    const res = await fetch(slideUrl);
    if (!res.ok) {
      console.warn(`[Social] Falha ao gerar slide ${filename}: HTTP ${res.status}`);
      return null;
    }
    const buffer = Buffer.from(await res.arrayBuffer());
    return uploadSocialImage({ data: buffer, mimeType: 'image/png', filename });
  } catch (err) {
    console.warn(`[Social] Erro ao processar slide ${filename}:`, err);
    return null;
  }
}

/**
 * Gera e faz upload de todos os slides de um carrossel em paralelo.
 * Retorna array com as URLs públicas (na ordem original).
 */
async function buildCarouselImages(carousel: CarouselPost, topicType: string, topicCategory: string): Promise<string[]> {
  const total = carousel.slides.length + 2; // cover + items + cta
  const timestamp = Date.now();

  const slideConfigs: Array<{ params: Record<string, string>; filename: string }> = [
    // Slide de capa — com badge e categoria para tema de cor dinâmico
    {
      params: {
        type: 'cover',
        badge: topicType,
        category: topicCategory,
        title: carousel.coverTitle,
        subtitle: carousel.coverSubtitle,
        current: '0',
        total: String(total),
      },
      filename: `carousel-${timestamp}-0-cover.png`,
    },
    // Slides de conteúdo
    ...carousel.slides.map((slide, i) => ({
      params: {
        type: 'item',
        category: topicCategory,
        number: String(i + 1),
        title: slide.title,
        description: slide.description,
        law: slide.law,
        current: String(i + 1),
        total: String(total),
      },
      filename: `carousel-${timestamp}-${i + 1}-item.png`,
    })),
    // Slide de CTA
    {
      params: {
        type: 'cta',
        category: topicCategory,
        current: String(total - 1),
        total: String(total),
      },
      filename: `carousel-${timestamp}-${total - 1}-cta.png`,
    },
  ];

  // Geração em paralelo — reduz tempo de ~49s para ~10s
  const urlsOrNull = await Promise.all(
    slideConfigs.map(async (config) => {
      const url = await fetchAndUploadSlide(buildSlideImageUrl(config.params), config.filename);
      if (!url) console.warn(`[Social] Slide ${config.filename} não gerado — pulando`);
      return url;
    })
  );

  return urlsOrNull.filter((url): url is string => url !== null);
}

/**
 * Gera texto do primeiro comentário para postar como a própria conta.
 * Objetivo: gerar sinal algorítmico + incluir link clicável.
 */
function buildFirstComment(ctaUrl: string): string {
  const variations = [
    `🛡️ Quer ver se SEU contrato tem cláusula ilegal? Análise em 30s (grátis): ${ctaUrl}\n\nQual cláusula mais absurda VOCÊ já viu? Conta aqui 👇`,
    `🔍 Analisa seu próprio contrato aqui em 30 segundos (grátis, sem cadastro): ${ctaUrl}\n\nJá pegou uma pegadinha num contrato? Comenta aí 💬`,
    `⚖️ Testa seu contrato antes de assinar: ${ctaUrl}\n\nConhece alguém que caiu numa dessas? Marca a pessoa 👇`,
  ];
  return variations[Math.floor(Math.random() * variations.length)]!;
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
  const tikTokOk = isTikTokConfigured();
  const brevoOk = isBrevoConfigured();

  const anyConfigured =
    metaConfig.facebook || metaConfig.instagram || metaConfig.threads ||
    telegramOk || linkedInOk || tikTokOk || brevoOk;

  if (!anyConfigured) {
    return { success: false, topicKey: 'none', error: 'Nenhuma rede social configurada' };
  }

  // 3. Escolher tema
  let postedTopics = await getPostedTopics();
  const [lastCategory, lastType] = await Promise.all([getLastCategory(), getLastType()]);

  if (postedTopics.length >= TOPIC_BANK.length) {
    await resetPostedTopics();
    postedTopics = [];
  }

  const topic = pickNextTopic(postedTopics, lastCategory, lastType);
  console.log(`[Social] Tema: ${topic.key} (${topic.category}/${topic.type})`);

  // 4. Gerar conteúdo em formato carrossel
  const carousel = await generateCarouselPost(topic);
  console.log(`[Social] Carrossel gerado: "${carousel.coverTitle}" (${carousel.slides.length} slides)`);

  const fullCaption = carousel.caption;

  if (dryRun) {
    console.log('[Social] DRY RUN — não publicando.');
    console.log('[Social] Caption:', fullCaption);
    return { success: true, topicKey: topic.key };
  }

  // 5. Gerar e fazer upload das imagens do carrossel (em paralelo)
  console.log('[Social] Gerando slides em paralelo...');
  const carouselImageUrls = await buildCarouselImages(carousel, topic.type, topic.category);
  console.log(`[Social] ${carouselImageUrls.length} slides prontos`);

  // Fallback: se não gerou slides suficientes para carrossel (min 2), usar URL simples
  const hasCarousel = carouselImageUrls.length >= 2;
  const firstImageUrl = carouselImageUrls[0] || `${APP_URL}/api/social/image/placeholder?category=${topic.category}`;

  // 6. Publicar em paralelo em todos os canais configurados
  const [fbResult, igResult, threadsResult, telegramResult, linkedInResult, tikTokResult] =
    await Promise.all([
      // Facebook — álbum com todos os slides do carrossel
      metaConfig.facebook
        ? (hasCarousel
            ? postAlbumToFacebook({ message: fullCaption, imageUrls: carouselImageUrls })
            : Promise.resolve({ id: '', success: false, error: 'slides insuficientes' } as MetaPostResult))
        : Promise.resolve(undefined as MetaPostResult | undefined),

      // Instagram — carrossel
      metaConfig.instagram
        ? (hasCarousel
            ? postCarouselToInstagram({ caption: fullCaption, imageUrls: carouselImageUrls })
            : Promise.resolve({ id: '', success: false, error: 'slides insuficientes' } as MetaPostResult))
        : Promise.resolve(undefined as MetaPostResult | undefined),

      // Threads — primeiro slide + caption
      metaConfig.threads
        ? postToThreads({ text: fullCaption, imageUrl: firstImageUrl })
        : Promise.resolve(undefined as MetaPostResult | undefined),

      // Telegram — primeiro slide + caption
      telegramOk
        ? postToTelegram({ text: fullCaption, imageUrl: firstImageUrl })
        : Promise.resolve(undefined as SocialPostResult | undefined),

      // LinkedIn — texto + link para o site
      linkedInOk
        ? postToLinkedIn({ text: fullCaption, url: APP_URL })
        : Promise.resolve(undefined as SocialPostResult | undefined),

      // TikTok — carrossel de fotos
      tikTokOk
        ? (hasCarousel
            ? postCarouselToTikTok({ caption: fullCaption, imageUrls: carouselImageUrls })
            : Promise.resolve({ success: false, error: 'slides insuficientes' } as SocialPostResult))
        : Promise.resolve(undefined as SocialPostResult | undefined),
    ]);

  // 7. Newsletter (separada — envolve geração de HTML)
  let newsletterResult: SocialPostResult | undefined;
  if (brevoOk) {
    const htmlContent = buildNewsletterHtml({
      text: carousel.caption,
      hashtags: [],
      imageUrl: firstImageUrl,
      appUrl: APP_URL,
    });
    newsletterResult = await sendNewsletter({
      subject: `💡 ${carousel.imageHeadline} — ContratoSeguro`,
      htmlContent,
    });
  }

  // 8. Log dos resultados
  if (fbResult) console.log('[Social] Facebook:', fbResult.success ? `OK (${fbResult.id})` : `ERRO: ${fbResult.error}`);
  if (igResult) console.log('[Social] Instagram:', igResult.success ? `OK (${igResult.id})` : `ERRO: ${igResult.error}`);
  if (threadsResult) console.log('[Social] Threads:', threadsResult.success ? `OK (${threadsResult.id})` : `ERRO: ${threadsResult.error}`);
  if (telegramResult) console.log('[Social] Telegram:', telegramResult.success ? `OK (${telegramResult.id})` : `ERRO: ${telegramResult.error}`);
  if (linkedInResult) console.log('[Social] LinkedIn:', linkedInResult.success ? `OK (${linkedInResult.id})` : `ERRO: ${linkedInResult.error}`);
  if (tikTokResult) console.log('[Social] TikTok:', tikTokResult.success ? `OK (${tikTokResult.id})` : `ERRO: ${tikTokResult.error}`);
  if (newsletterResult) console.log('[Social] Newsletter:', newsletterResult.success ? `OK (${newsletterResult.id})` : `ERRO: ${newsletterResult.error}`);

  // Salvar URL da capa para o cron de Stories (reaproveita 24h depois)
  if (carouselImageUrls[0]) {
    await recordLastCoverUrl(carouselImageUrls[0]);
  }

  // Primeiro comentário automático no IG — sinal algorítmico + link clicável
  if (igResult?.success && igResult.id) {
    const ctaUrl = `${APP_URL}?utm_source=instagram&utm_medium=comment&utm_campaign=${topic.key}`;
    const commentText = buildFirstComment(ctaUrl);
    const commentResult = await postFirstComment({ mediaId: igResult.id, text: commentText });
    console.log('[Social] IG first comment:', commentResult.success ? `OK (${commentResult.id})` : `ERRO: ${commentResult.error}`);
  }

  const anySuccess =
    (fbResult?.success ?? false) ||
    (igResult?.success ?? false) ||
    (threadsResult?.success ?? false) ||
    (telegramResult?.success ?? false) ||
    (linkedInResult?.success ?? false) ||
    (tikTokResult?.success ?? false) ||
    (newsletterResult?.success ?? false);

  // 9. Registrar no estado
  if (anySuccess) {
    const today = new Date().toISOString().split('T')[0];
    await recordPost({
      date: today,
      topicKey: topic.key,
      postType: topic.type,
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
    tiktok: tikTokResult,
    newsletter: newsletterResult,
  };
}
