/**
 * Análise da transcrição — Claude Haiku gera título, descrição, hashtags,
 * hook e pontos de corte a partir dos segmentos do Whisper.
 *
 * É o "cérebro criativo" do pipeline. O output daqui guia toda a edição
 * (cortes) e a postagem (copy, hashtags, agendamento de thumbnail).
 */

import { callClaude } from '@/lib/ai/client';
import { safeParseJSON } from '@/lib/ai/utils';
import { AI_MODELS } from '@/config/constants';
import type { TranscriptSegment, TranscriptionAnalysis, VideoCut } from './types';

const SITE_URL_FALLBACK = 'contratoseguro.com.br';

const SYSTEM_PROMPT = `Você é um estrategista de Reels especializado em conteúdo jurídico brasileiro sobre contratos.

Sua tarefa: analisar a transcrição de um vídeo curto (30-90s) e gerar metadados para postagem automática em Instagram Reels, Facebook Reels e YouTube Shorts.

REGRAS:
1. Título (até 60 chars): use número, pergunta ou choque para provocar clique. Ex.: "3 cláusulas que já te roubaram", "Seu aluguel tem ISSO?". Nunca clickbait enganoso.
2. Descrição: 2-3 parágrafos curtos, linguagem simples, 1 emoji por parágrafo MAX. Sempre termina com: "👉 Analise seu contrato grátis em contratoseguro.com.br".
3. Hashtags Instagram (10): mix de volume alto (#direito, #contratos), médio (#direitosdoconsumidor) e baixo (#clausulaabusiva). Sem acento, sem espaço, lowercase, sem "#".
4. Hashtags YouTube (5): mais específicas do tema, sem acento, sem "#".
5. Hook: identificar início-fim do trecho mais forte dos primeiros 10 segundos. O vídeo vai girar em torno desse hook para garantir retenção.
6. Cortes: listar trechos para REMOVER. Inclua silêncios > 1.5s, "hmm", "tipo", "é", repetições, enrolação. Preserve conteúdo útil.
7. Thumbnail: escolha o segundo mais impactante (expressão facial forte, dado numérico) e um texto de até 4 palavras para overlay.

FORMATO DE SAÍDA (JSON estrito, APENAS o JSON, sem texto antes ou depois):
{
  "title": "string até 60 chars",
  "description": "string com \\n entre parágrafos, termina com CTA para contratoseguro.com.br",
  "hashtags_instagram": ["10 strings"],
  "hashtags_youtube": ["5 strings"],
  "hook_seconds": [inicio_em_segundos, fim_em_segundos],
  "cuts": [{"start": 12.3, "end": 15.1, "reason": "pausa longa"}],
  "thumbnail_moment": 8.5,
  "thumbnail_text": "string até 4 palavras"
}`;

export type AnalyzeTranscriptionResult = {
  analysis: TranscriptionAnalysis;
  tokensInput: number;
  tokensOutput: number;
  durationMs: number;
};

/**
 * Analisa a transcrição e retorna metadados prontos para edição/postagem.
 *
 * @param segments - saída do Whisper (já em /lib/reels/whisper.ts)
 * @param userContext - contexto opcional do usuário no upload ("tema: pegadinhas de aluguel")
 */
export async function analyzeTranscription(
  segments: TranscriptSegment[],
  userContext?: string | null
): Promise<AnalyzeTranscriptionResult> {
  if (segments.length === 0) {
    throw new Error('Transcrição vazia — impossível analisar');
  }

  const transcriptLines = segments
    .map((s) => `[${s.start.toFixed(1)}s] ${s.text}`)
    .join('\n');

  const userPrompt = `<transcricao>
${transcriptLines}
</transcricao>

<contexto_opcional>${userContext?.trim() || 'nenhum'}</contexto_opcional>

Analise o vídeo e retorne o JSON conforme especificado. Lembre-se: título provocativo, descrição termina com CTA para ${SITE_URL_FALLBACK}, hashtags sem "#" nem acento.`;

  const result = await callClaude({
    model: AI_MODELS.analysis,
    systemPrompt: SYSTEM_PROMPT,
    userPrompt,
    maxTokens: 1500,
    temperature: 0.4,
    timeoutMs: 60_000,
  });

  const raw = safeParseJSON(result.content) as Partial<TranscriptionAnalysis> | null;
  if (!raw || typeof raw !== 'object') {
    throw new Error('Análise de transcrição retornou JSON inválido');
  }

  // Validação mínima + defaults seguros
  const analysis: TranscriptionAnalysis = {
    title: typeof raw.title === 'string' ? raw.title.slice(0, 80) : 'Reel sobre contratos',
    description: typeof raw.description === 'string' ? raw.description : '',
    hashtags_instagram: sanitizeHashtags(raw.hashtags_instagram, 10),
    hashtags_youtube: sanitizeHashtags(raw.hashtags_youtube, 5),
    hook_seconds: sanitizeHook(raw.hook_seconds),
    cuts: sanitizeCuts(raw.cuts),
    thumbnail_moment:
      typeof raw.thumbnail_moment === 'number' && raw.thumbnail_moment >= 0
        ? raw.thumbnail_moment
        : Math.min(3, segments[0]?.end ?? 0),
    thumbnail_text:
      typeof raw.thumbnail_text === 'string'
        ? raw.thumbnail_text.slice(0, 40)
        : 'Contrato Seguro',
  };

  // Garantir CTA no final da descrição
  if (!analysis.description.toLowerCase().includes('contratoseguro.com.br')) {
    analysis.description += `\n\n👉 Analise seu contrato grátis em ${SITE_URL_FALLBACK}`;
  }

  return {
    analysis,
    tokensInput: result.tokensInput,
    tokensOutput: result.tokensOutput,
    durationMs: result.durationMs,
  };
}

function sanitizeHashtags(raw: unknown, max: number): string[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((h): h is string => typeof h === 'string')
    .map((h) =>
      h
        .replace(/^#/, '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '')
        .toLowerCase()
    )
    .filter((h) => h.length > 0 && h.length <= 40)
    .slice(0, max);
}

function sanitizeHook(raw: unknown): [number, number] {
  if (
    Array.isArray(raw) &&
    raw.length === 2 &&
    typeof raw[0] === 'number' &&
    typeof raw[1] === 'number' &&
    raw[1] > raw[0]
  ) {
    return [raw[0], raw[1]];
  }
  return [0, 3];
}

function sanitizeCuts(raw: unknown): VideoCut[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(
      (c): c is VideoCut =>
        c !== null &&
        typeof c === 'object' &&
        typeof (c as VideoCut).start === 'number' &&
        typeof (c as VideoCut).end === 'number' &&
        (c as VideoCut).end > (c as VideoCut).start
    )
    .map((c) => ({
      start: c.start,
      end: c.end,
      reason: typeof c.reason === 'string' ? c.reason : 'corte',
    }));
}
