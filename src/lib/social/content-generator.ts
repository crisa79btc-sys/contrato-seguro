/**
 * Gera conteúdo para redes sociais usando Claude AI.
 * Reutiliza callClaude() do módulo de IA existente.
 */

import { callClaude } from '@/lib/ai/client';
import { safeParseJSON } from '@/lib/ai/utils';
import { SOCIAL_MEDIA } from '@/config/constants';
import type { TopicTemplate, GeneratedPost, CarouselPost } from './types';
import { FALLBACK_POSTS } from './topics';

const APP_URL = (process.env.NEXT_PUBLIC_APP_URL || 'https://contrato-seguro-inky.vercel.app').trim();

const SYSTEM_PROMPT = `Você é um social media manager especializado em direito contratual brasileiro.
Sua missão é criar posts educativos, acessíveis e engajantes sobre contratos e direitos.

REGRAS:
- Escreva em português brasileiro informal mas profissional
- Use emojis estrategicamente (2-4 por post)
- O post deve ter entre 100-250 palavras
- Inclua SEMPRE um CTA (call-to-action) para: ${APP_URL}
- Inclua SEMPRE ao final: "⚖️ Conteúdo informativo. Não substitui orientação jurídica profissional."
- Gere 3-5 hashtags relevantes em português
- Gere um headline curto (5-8 palavras) para a imagem do post
- Seja preciso juridicamente — cite artigos de lei quando relevante
- NUNCA invente leis ou artigos que não existem

FORMATO DE RESPOSTA (JSON):
{
  "text": "texto completo do post com emojis e CTA",
  "hashtags": ["#hashtag1", "#hashtag2", "#hashtag3"],
  "imageHeadline": "Headline curto para imagem"
}

Retorne APENAS o JSON, sem markdown ou explicações.`;

/**
 * Gera um post para redes sociais com base no tema fornecido.
 */
export async function generateSocialPost(topic: TopicTemplate): Promise<GeneratedPost> {
  try {
    const typeInstructions: Record<string, string> = {
      dica: 'Crie um post no formato "Você sabia que..." com uma dica prática.',
      mito_verdade: 'Crie um post no formato "MITO ou VERDADE?" quebrando um mito comum.',
      checklist: 'Crie um post no formato de checklist com itens numerados ou com ✅.',
      estatistica: 'Crie um post usando um dado/estatística impactante como gancho.',
      pergunta: 'Crie um post com uma pergunta engajante para o público comentar.',
    };

    const userPrompt = `Tipo de post: ${typeInstructions[topic.type]}
Categoria: ${topic.category}
Tema: ${topic.promptHint}

Gere o post agora.`;

    const result = await callClaude({
      model: SOCIAL_MEDIA.AI_MODEL,
      systemPrompt: SYSTEM_PROMPT,
      userPrompt,
      maxTokens: SOCIAL_MEDIA.MAX_TOKENS,
      temperature: 0.7,
      timeoutMs: SOCIAL_MEDIA.TIMEOUT_MS,
    });

    const parsed = safeParseJSON(result.content) as Record<string, unknown> | null;
    if (parsed && typeof parsed.text === 'string' && typeof parsed.imageHeadline === 'string') {
      return {
        text: parsed.text,
        hashtags: Array.isArray(parsed.hashtags) ? (parsed.hashtags as string[]) : [],
        imageHeadline: parsed.imageHeadline,
      };
    }

    console.error('[Social] Claude retornou formato inválido, usando fallback');
    return getRandomFallback();
  } catch (err) {
    console.error('[Social] Erro na geração de conteúdo:', err);
    return getRandomFallback();
  }
}

function getRandomFallback(): GeneratedPost {
  const index = Math.floor(Math.random() * FALLBACK_POSTS.length);
  return FALLBACK_POSTS[index];
}

const CAROUSEL_SYSTEM_PROMPT = `Você é um social media manager especializado em direito contratual brasileiro.
Crie carrosséis educativos para Instagram/Facebook com 4 a 7 slides sobre um tema jurídico.

REGRAS DE CONTEÚDO:
- Escreva em português brasileiro informal mas preciso juridicamente
- Cada slide deve ter título curto (máx 6 palavras), descrição (1-2 frases) e base legal REAL
- Cite apenas artigos que existem (CDC, CLT, CC, CF) — NUNCA invente
- imageHeadline: 5-7 palavras impactantes para o slide de capa

REGRAS DA LEGENDA (caption):
- PRIMEIRA LINHA: gancho impactante — pergunta curiosa OU fato surpreendente que prenda atenção
  Exemplos bons: "Você sabia que pode perder tudo por não ler uma cláusula? 🤔"
                 "⚠️ 90% das pessoas assinam contratos sem entender o que está escrito"
                 "Já assinou algo sem ler? Isso pode custar caro. 👇"
- CONTEÚDO: 3-4 linhas com os pontos principais (pode usar emojis e numeração)
- PERGUNTA DE ENGAJAMENTO: 1 linha pedindo ao público para comentar experiência ou opinião
- LINK: 🛡️ Analise seu contrato GRÁTIS: ${APP_URL}
- DISCLAIMER: ⚖️ Conteúdo informativo. Não substitui orientação jurídica profissional.
- HASHTAGS: 3-5 tags relevantes em português
- Total da caption: 150-220 palavras
- NÃO coloque o link na primeira linha — o gancho vem primeiro

FORMATO DE RESPOSTA (JSON):
{
  "caption": "legenda completa seguindo a estrutura acima (gancho → conteúdo → engajamento → link → disclaimer → hashtags)",
  "coverTitle": "Título da capa (máx 6 palavras)",
  "coverSubtitle": "Subtítulo da capa (1 linha, complementa o título)",
  "imageHeadline": "Headline para a imagem de capa (5-7 palavras impactantes)",
  "slides": [
    {
      "title": "Título do item (máx 6 palavras)",
      "description": "Descrição prática em 1-2 frases.",
      "law": "Art. XX da Lei YYYY"
    }
  ]
}

Gere entre 4 e 7 slides (adeque a quantidade ao tema — checklist pede mais, dica simples pede menos).
Retorne APENAS o JSON, sem markdown ou comentários.`;

/**
 * Gera um post em formato carrossel para Instagram/Facebook.
 */
export async function generateCarouselPost(topic: TopicTemplate): Promise<CarouselPost> {
  try {
    const userPrompt = `Tema: ${topic.promptHint}
Categoria: ${topic.category}
Tipo: ${topic.type}

Crie um carrossel educativo sobre este tema. Cada slide deve cobrir um aspecto diferente e prático.`;

    const result = await callClaude({
      model: SOCIAL_MEDIA.AI_MODEL,
      systemPrompt: CAROUSEL_SYSTEM_PROMPT,
      userPrompt,
      maxTokens: 1800,
      temperature: 0.65,
      timeoutMs: SOCIAL_MEDIA.TIMEOUT_MS,
    });

    const parsed = safeParseJSON(result.content) as Record<string, unknown> | null;

    if (
      parsed &&
      typeof parsed.caption === 'string' &&
      typeof parsed.coverTitle === 'string' &&
      Array.isArray(parsed.slides) &&
      (parsed.slides as unknown[]).length >= 3
    ) {
      return {
        caption: parsed.caption,
        coverTitle: parsed.coverTitle,
        coverSubtitle: typeof parsed.coverSubtitle === 'string' ? parsed.coverSubtitle : '',
        imageHeadline: typeof parsed.imageHeadline === 'string' ? parsed.imageHeadline : parsed.coverTitle,
        slides: (parsed.slides as Array<Record<string, string>>).slice(0, 7).map((s) => ({
          title: s.title || '',
          description: s.description || '',
          law: s.law || '',
        })),
      };
    }

    console.error('[Social] Claude retornou formato inválido para carrossel');
    return getFallbackCarousel();
  } catch (err) {
    console.error('[Social] Erro na geração de carrossel:', err);
    return getFallbackCarousel();
  }
}

function getFallbackCarousel(): CarouselPost {
  return {
    caption: `Você já assinou um contrato sem ler o que estava escrito? 🤔

Conheça 5 cláusulas abusivas que todo brasileiro precisa conhecer:

1️⃣ Foro em cidade diferente — você pode ajuizar na sua cidade (CDC art. 101, I)
2️⃣ Multa rescisória excessiva — não pode superar a obrigação principal (CC arts. 412-413)
3️⃣ "Sem responsabilidade por nada" — renúncia total viola a boa-fé objetiva (CC art. 422)
4️⃣ Sem direito à devolução — retenção integral de valores é abusiva (CDC art. 51, II)
5️⃣ Fidelidade unilateral — sem contrapartida real, desequilibra o contrato (CC art. 421)

Você já encontrou alguma dessas cláusulas? Conta nos comentários 👇

🛡️ Analise seu contrato GRÁTIS: ${APP_URL}

⚖️ Conteúdo informativo. Não substitui orientação jurídica profissional.

#DireitoDoConsumidor #ContratoAbusivo #SeusDireitos #ProtecaoContratual #ContratoSeguro`,
    coverTitle: '5 cláusulas ABUSIVAS',
    coverSubtitle: 'que todo brasileiro precisa conhecer antes de assinar',
    imageHeadline: '5 cláusulas abusivas no contrato',
    slides: [
      { title: 'Foro em outra cidade', description: 'Em contrato de consumo, você pode ajuizar na sua cidade.', law: 'CDC art. 101, I' },
      { title: 'Multa rescisória abusiva', description: 'Multa não pode ultrapassar o valor da obrigação principal.', law: 'CC arts. 412-413' },
      { title: 'Sem responsabilidade', description: 'Renúncia total à responsabilidade viola a boa-fé objetiva.', law: 'CC art. 422' },
      { title: 'Sem devolução de valores', description: 'Reter 100% do que o cliente pagou é cláusula abusiva.', law: 'CDC art. 51, II' },
      { title: 'Fidelidade sem benefício', description: 'Fidelidade unilateral sem contrapartida desequilibra o contrato.', law: 'CC art. 421' },
    ],
  };
}
