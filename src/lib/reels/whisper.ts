/**
 * Whisper via Replicate — transcrição de áudio/vídeo em português.
 *
 * Usa o modelo "vaibhavs10/incredibly-fast-whisper" no Replicate.
 * Por que Replicate e não OpenAI Whisper direto?
 *   - ~10× mais barato (~$0.0002/s vs $0.006/min da OpenAI).
 *   - Retorna segments com timestamps direto (precisa setar return_timestamps).
 *   - Webhook suportado para processamento assíncrono.
 *
 * Setup externo: criar conta em https://replicate.com → token em .env:
 *   REPLICATE_API_TOKEN=r8_xxx
 *
 * Nota: Replicate roda async. Para vídeos longos, usar webhook. Para vídeos
 * curtos (até 90s dos nossos Reels), o polling síncrono fecha em ~10-20s.
 */

import type { WhisperResult, TranscriptSegment } from './types';

const REPLICATE_API = 'https://api.replicate.com/v1';
const MODEL_VERSION =
  // vaibhavs10/incredibly-fast-whisper — fixar versão para evitar quebras
  // Atualizar se a versão for deprecada: https://replicate.com/vaibhavs10/incredibly-fast-whisper
  '3ab86df6c8f54c11309d4d1f930ac292bad43ace52d10c80d87eb258b3c9f79c';

type ReplicatePrediction = {
  id: string;
  status: 'starting' | 'processing' | 'succeeded' | 'failed' | 'canceled';
  output?: {
    text: string;
    chunks?: Array<{ timestamp: [number, number]; text: string }>;
  };
  error?: string;
};

function getToken(): string {
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) throw new Error('REPLICATE_API_TOKEN não configurado');
  return token;
}

/**
 * Transcreve um vídeo/áudio via Whisper no Replicate.
 *
 * @param audioUrl - URL pública do arquivo (ex: signed URL do Supabase Storage
 *                   ou URL do bucket public reels-raw)
 * @returns transcrição completa + segmentos com timestamps
 */
export async function transcribeAudio(audioUrl: string): Promise<WhisperResult> {
  const token = getToken();

  // 1. Criar predição
  const createRes = await fetch(`${REPLICATE_API}/predictions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      version: MODEL_VERSION,
      input: {
        audio: audioUrl,
        language: 'portuguese',
        batch_size: 24,
        timestamp: 'chunk',
      },
    }),
  });

  if (!createRes.ok) {
    throw new Error(`Replicate create falhou: ${createRes.status} ${await createRes.text()}`);
  }

  const prediction = (await createRes.json()) as ReplicatePrediction;

  // 2. Polling até concluir (timeout 3 min)
  const deadline = Date.now() + 180_000;
  let current = prediction;
  while (current.status === 'starting' || current.status === 'processing') {
    if (Date.now() > deadline) throw new Error('Whisper timeout (3min)');
    await new Promise((r) => setTimeout(r, 2000));
    const statusRes = await fetch(`${REPLICATE_API}/predictions/${current.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    current = (await statusRes.json()) as ReplicatePrediction;
  }

  if (current.status !== 'succeeded' || !current.output) {
    throw new Error(`Whisper falhou: ${current.error ?? current.status}`);
  }

  // 3. Normalizar output para WhisperResult
  const segments: TranscriptSegment[] = (current.output.chunks ?? []).map((c) => ({
    start: c.timestamp[0] ?? 0,
    end: c.timestamp[1] ?? 0,
    text: (c.text ?? '').trim(),
  }));

  const duration =
    segments.length > 0 ? segments[segments.length - 1].end : 0;

  return {
    text: current.output.text,
    language: 'pt',
    duration,
    segments,
  };
}
