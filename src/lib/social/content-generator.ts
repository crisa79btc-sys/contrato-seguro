/**
 * Gera conteúdo para redes sociais usando Claude AI.
 * Reutiliza callClaude() do módulo de IA existente.
 */

import { callClaude } from '@/lib/ai/client';
import { safeParseJSON } from '@/lib/ai/utils';
import { SOCIAL_MEDIA } from '@/config/constants';
import type { TopicTemplate, GeneratedPost } from './types';
import { FALLBACK_POSTS } from './topics';

const SYSTEM_PROMPT = `Você é um social media manager especializado em direito contratual brasileiro.
Sua missão é criar posts educativos, acessíveis e engajantes sobre contratos e direitos.

REGRAS:
- Escreva em português brasileiro informal mas profissional
- Use emojis estrategicamente (2-4 por post)
- O post deve ter entre 100-250 palavras
- Inclua SEMPRE um CTA (call-to-action) para: contrato-seguro-inky.vercel.app
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
