/**
 * Script de postagem manual — carrossel simultâneo no Instagram e Facebook.
 *
 * Fluxo:
 *   1. Deleta posts antigos do Instagram e Facebook
 *   2. Gera 7 slides via next/og (cover + 5 itens + CTA)
 *   3. Faz upload de cada slide para Supabase Storage
 *   4. Publica carrossel no Instagram (3 etapas)
 *   5. Publica álbum no Facebook (photos + feed)
 *
 * Uso: node scripts/post-instagram-now.mjs
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// ─── Ler .env.local ───────────────────────────────────────────────────────────
const envPath = new URL('../.env.local', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1');
const envContent = readFileSync(envPath, 'utf-8');
const env = Object.fromEntries(
  envContent.split('\n')
    .filter(l => l && !l.startsWith('#') && l.includes('='))
    .map(l => {
      const i = l.indexOf('=');
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    })
);

const SUPABASE_URL         = env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;
const IG_USER_ID           = env.META_IG_USER_ID;
const PAGE_ID              = env.META_PAGE_ID;
const ACCESS_TOKEN         = env.META_PAGE_ACCESS_TOKEN;

// APP_URL: URL pública do site (usada no caption, CTA, etc.)
const APP_URL = (env.NEXT_PUBLIC_APP_URL || 'https://contrato-seguro-inky.vercel.app').trim();

// IMAGE_BASE_URL: servidor que gera os slides via next/og.
// Usa localhost porque a Vercel ainda tem o código antigo.
// As imagens são baixadas aqui e depois enviadas ao Supabase — o Instagram
// só vê a URL limpa do Supabase, nunca o localhost.
const IMAGE_BASE_URL = 'http://localhost:3000';

const GRAPH_API = 'https://graph.facebook.com/v21.0';
const BUCKET    = 'social-images';

// ─── Conteúdo do carrossel ────────────────────────────────────────────────────

const CAROUSEL = {
  caption: `Você já assinou um contrato sem ler o que estava escrito? 🤔

Conheça 5 cláusulas ABUSIVAS que todo brasileiro precisa identificar antes de assinar:

1️⃣ Foro em cidade diferente — você pode ajuizar na sua cidade (CDC art. 101, I)
2️⃣ Multa rescisória excessiva — não pode superar a obrigação principal (CC arts. 412-413)
3️⃣ "Sem responsabilidade por nada" — renúncia total viola a boa-fé objetiva (CC art. 422)
4️⃣ Sem direito à devolução — reter 100% dos valores pagos é abusivo (CDC art. 51, II)
5️⃣ Fidelidade sem benefício — sem contrapartida real, desequilibra o contrato (CC art. 421)

Você já encontrou alguma dessas cláusulas? Conta aqui nos comentários! 👇

🛡️ Analise seu contrato GRÁTIS com IA: ${APP_URL}

⚖️ Conteúdo informativo. Não substitui orientação jurídica profissional.

#DireitoDoConsumidor #ContratoAbusivo #SeusDireitos #ProtecaoContratual #ContratoSeguro`,

  coverTitle: '5 cláusulas ABUSIVAS',
  coverSubtitle: 'que todo brasileiro precisa conhecer antes de assinar',

  slides: [
    {
      number: '1',
      title: 'Foro em outra cidade',
      description: 'Em contrato de consumo, você tem o direito de ajuizar na sua própria cidade.',
      law: 'CDC art. 101, I',
    },
    {
      number: '2',
      title: 'Multa rescisória abusiva',
      description: 'A multa contratual não pode ultrapassar o valor da obrigação principal.',
      law: 'CC arts. 412-413',
    },
    {
      number: '3',
      title: 'Sem responsabilidade alguma',
      description: 'Renúncia total à responsabilidade viola a boa-fé objetiva e pode ser anulada.',
      law: 'CC art. 422',
    },
    {
      number: '4',
      title: 'Sem devolução de valores',
      description: 'Reter 100% do que o cliente pagou é cláusula abusiva no Código de Defesa do Consumidor.',
      law: 'CDC art. 51, II',
    },
    {
      number: '5',
      title: 'Fidelidade sem benefício',
      description: 'Prazo de fidelidade unilateral, sem nenhuma contrapartida real, desequilibra o contrato.',
      law: 'CC art. 421',
    },
  ],
};

const TOTAL_SLIDES = CAROUSEL.slides.length + 2; // cover + items + cta

// Tipo do post para o badge dinâmico na capa (dica | mito_verdade | checklist | estatistica | pergunta)
const POST_TYPE = 'checklist';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildSlideUrl(params) {
  const qs = new URLSearchParams(params).toString();
  return `${IMAGE_BASE_URL}/api/social/image/carousel?${qs}`;
}

async function fetchSlideImage(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} ao gerar slide: ${url}`);
  const buffer = Buffer.from(await res.arrayBuffer());
  return buffer;
}

async function uploadToSupabase(buffer, filename) {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  const path = `posts/${filename}`;

  // Garantir bucket
  await supabase.storage.createBucket(BUCKET, {
    public: true,
    fileSizeLimit: 5 * 1024 * 1024,
    allowedMimeTypes: ['image/png', 'image/jpeg'],
  }).catch(() => {});

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, buffer, { contentType: 'image/png', upsert: true });

  if (error) throw new Error(`Upload falhou: ${error.message}`);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  if (!data?.publicUrl) throw new Error('URL pública não disponível');

  return data.publicUrl;
}

// ─── Deletar posts antigos ────────────────────────────────────────────────────

async function deleteOldInstagramPosts() {
  console.log('\n🗑️  Buscando posts do Instagram para deletar...');

  const res = await fetch(
    `${GRAPH_API}/${IG_USER_ID}/media?fields=id,timestamp&limit=20&access_token=${ACCESS_TOKEN}`
  );
  const data = await res.json();

  if (!data.data?.length) {
    console.log('   Nenhum post encontrado.');
    return;
  }

  let deleted = 0;
  for (const post of data.data) {
    const delRes = await fetch(`${GRAPH_API}/${post.id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ access_token: ACCESS_TOKEN }),
    });
    const delData = await delRes.json();

    if (delData.success || delData === true) {
      console.log(`   ✅ Instagram post ${post.id} deletado`);
      deleted++;
    } else {
      // Instagram frequentemente não suporta DELETE via API — não é erro crítico
      console.log(`   ⚠️  Instagram ${post.id}: ${JSON.stringify(delData).slice(0, 80)}`);
    }
  }

  if (deleted === 0) {
    console.log('   ℹ️  A API do Instagram não permite deleção de posts publicados via Graph API.');
    console.log('      Delete manualmente pelo app do Instagram se necessário.');
  }
}

async function deleteOldFacebookPosts() {
  console.log('\n🗑️  Buscando posts do Facebook para deletar...');

  const res = await fetch(
    `${GRAPH_API}/${PAGE_ID}/posts?fields=id,created_time&limit=20&access_token=${ACCESS_TOKEN}`
  );
  const data = await res.json();

  if (!data.data?.length) {
    console.log('   Nenhum post encontrado.');
    return;
  }

  for (const post of data.data) {
    const delRes = await fetch(`${GRAPH_API}/${post.id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ access_token: ACCESS_TOKEN }),
    });
    const delData = await delRes.json();

    if (delData.success === true) {
      console.log(`   ✅ Facebook post ${post.id} deletado`);
    } else {
      console.log(`   ⚠️  Facebook ${post.id}: ${JSON.stringify(delData).slice(0, 80)}`);
    }
  }
}

// ─── Gerar e subir slides ─────────────────────────────────────────────────────

async function generateAndUploadSlides() {
  console.log('\n🎨 Gerando slides do carrossel...');
  const timestamp = Date.now();
  const imageUrls = [];

  const configs = [
    {
      params: {
        type: 'cover',
        badge: POST_TYPE,
        title: CAROUSEL.coverTitle,
        subtitle: CAROUSEL.coverSubtitle,
        current: '0',
        total: String(TOTAL_SLIDES),
      },
      name: `0-cover`,
    },
    ...CAROUSEL.slides.map((s, i) => ({
      params: {
        type: 'item',
        number: s.number,
        title: s.title,
        description: s.description,
        law: s.law,
        current: String(i + 1),
        total: String(TOTAL_SLIDES),
      },
      name: `${i + 1}-item`,
    })),
    {
      params: {
        type: 'cta',
        current: String(TOTAL_SLIDES - 1),
        total: String(TOTAL_SLIDES),
      },
      name: `${TOTAL_SLIDES - 1}-cta`,
    },
  ];

  for (const config of configs) {
    const slideUrl = buildSlideUrl(config.params);
    process.stdout.write(`   Slide ${config.name}... `);

    const buffer = await fetchSlideImage(slideUrl);
    const filename = `manual-${timestamp}-${config.name}.png`;
    const publicUrl = await uploadToSupabase(buffer, filename);

    imageUrls.push(publicUrl);
    console.log(`✅ ${(buffer.length / 1024).toFixed(0)}KB`);
  }

  console.log(`\n   ${imageUrls.length} slides prontos.`);
  return imageUrls;
}

// ─── Polling de status de container ──────────────────────────────────────────

async function waitForContainer(containerId, label = containerId) {
  const maxAttempts = 10;
  const intervalMs = 3000;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    await new Promise(r => setTimeout(r, intervalMs));

    const qs = new URLSearchParams({ fields: 'status_code', access_token: ACCESS_TOKEN });
    const res = await fetch(`${GRAPH_API}/${containerId}?${qs.toString()}`);
    const data = await res.json();

    if (data.status_code === 'FINISHED') {
      console.log(`   ✅ ${label}: FINISHED`);
      return true;
    }
    if (data.status_code === 'ERROR') {
      console.log(`   ❌ ${label}: ERROR`);
      return false;
    }
    process.stdout.write(`   ⏳ ${label}: ${data.status_code || '...'} (${attempt}/${maxAttempts})\r`);
  }

  console.log(`   ⚠️  ${label}: timeout após ${maxAttempts} tentativas`);
  return false;
}

// ─── Publicar Instagram carrossel ─────────────────────────────────────────────

async function postInstagramCarousel(imageUrls) {
  console.log('\n📸 Publicando carrossel no Instagram...');

  // Etapa 1: containers filhos
  console.log('   Criando containers filhos...');
  const childIds = [];

  for (let i = 0; i < imageUrls.length; i++) {
    const res = await fetch(`${GRAPH_API}/${IG_USER_ID}/media`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        access_token: ACCESS_TOKEN,
        image_url: imageUrls[i],
        is_carousel_item: true,
      }),
    });

    const data = await res.json();
    if (!data.id) throw new Error(`Falha no filho ${i + 1}: ${JSON.stringify(data)}`);

    childIds.push(data.id);
    console.log(`   ✅ Filho ${i + 1}/${imageUrls.length}: ${data.id}`);
  }

  // Aguardar todos os filhos ficarem FINISHED em paralelo
  // (Meta exige FINISHED antes de criar o container do carrossel)
  console.log(`   Aguardando ${childIds.length} containers ficarem prontos...`);
  const readyResults = await Promise.all(
    childIds.map((id, i) => waitForContainer(id, `filho ${i + 1}`))
  );
  const failedIndex = readyResults.findIndex(r => !r);
  if (failedIndex !== -1) {
    throw new Error(`Container filho ${failedIndex + 1} não ficou pronto`);
  }

  // Etapa 2: container de carrossel
  console.log('   Criando container do carrossel...');
  const carouselRes = await fetch(`${GRAPH_API}/${IG_USER_ID}/media`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      access_token: ACCESS_TOKEN,
      media_type: 'CAROUSEL',
      children: childIds.join(','),
      caption: CAROUSEL.caption,
    }),
  });

  const carouselData = await carouselRes.json();
  if (!carouselData.id) throw new Error(`Falha no carrossel: ${JSON.stringify(carouselData)}`);
  console.log(`   ✅ Container carrossel: ${carouselData.id}`);

  // Aguardar container do carrossel ficar FINISHED
  console.log('   Aguardando container do carrossel ficar pronto...');
  const carouselReady = await waitForContainer(carouselData.id, 'carrossel');
  if (!carouselReady) throw new Error('Container do carrossel não ficou pronto');

  // Etapa 3: publicar
  console.log('   Publicando...');
  const publishRes = await fetch(`${GRAPH_API}/${IG_USER_ID}/media_publish`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      access_token: ACCESS_TOKEN,
      creation_id: carouselData.id,
    }),
  });

  const publishData = await publishRes.json();
  if (publishData.id) {
    console.log(`   ✅ Publicado! ID: ${publishData.id}`);
    return publishData.id;
  }

  throw new Error(`Instagram: ${publishData.error?.message || JSON.stringify(publishData)}`);
}

// ─── Publicar Facebook álbum ──────────────────────────────────────────────────

async function postFacebookAlbum(imageUrls) {
  console.log('\n📘 Publicando álbum no Facebook...');

  // Etapa 1: upload das fotos como não publicadas
  console.log('   Fazendo upload das fotos...');
  const photoIds = [];

  for (let i = 0; i < imageUrls.length; i++) {
    const res = await fetch(`${GRAPH_API}/${PAGE_ID}/photos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        access_token: ACCESS_TOKEN,
        url: imageUrls[i],
        published: false,
      }),
    });

    const data = await res.json();
    if (!data.id) throw new Error(`Falha na foto ${i + 1}: ${JSON.stringify(data)}`);

    photoIds.push(data.id);
    console.log(`   ✅ Foto ${i + 1}/${imageUrls.length}: ${data.id}`);
  }

  // Etapa 2: criar post com fotos anexadas
  console.log('   Criando post no feed...');
  const feedRes = await fetch(`${GRAPH_API}/${PAGE_ID}/feed`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      access_token: ACCESS_TOKEN,
      message: CAROUSEL.caption,
      attached_media: photoIds.map(id => ({ media_fbid: id })),
    }),
  });

  const feedData = await feedRes.json();
  if (!feedData.id) throw new Error(`Falha no feed: ${JSON.stringify(feedData)}`);

  console.log(`   ✅ Post publicado: ${feedData.id}`);
  return feedData.id;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n🛡️  ContratoSeguro — Carrossel Manual');
  console.log('═'.repeat(55));
  console.log(`🌐 Usando API: ${APP_URL}`);
  console.log(`📊 Slides: ${TOTAL_SLIDES} (1 cover + ${CAROUSEL.slides.length} itens + 1 CTA)`);
  console.log('═'.repeat(55));

  try {
    // 1. Deletar posts antigos
    await deleteOldInstagramPosts();
    await deleteOldFacebookPosts();

    // 2. Gerar e subir slides
    const imageUrls = await generateAndUploadSlides();

    // 3. Publicar nos dois canais
    const [igPostId, fbPostId] = await Promise.all([
      postInstagramCarousel(imageUrls),
      postFacebookAlbum(imageUrls),
    ]);

    console.log('\n' + '═'.repeat(55));
    console.log('🎉 CARROSSEL PUBLICADO COM SUCESSO!');
    console.log(`📸 Instagram ID : ${igPostId}`);
    console.log(`📘 Facebook ID  : ${fbPostId}`);
    console.log('═'.repeat(55));
    console.log('\nAbra o Instagram e o Facebook para conferir ✅');

  } catch (err) {
    console.error('\n❌ Erro:', err.message);
    process.exit(1);
  }
}

main();
