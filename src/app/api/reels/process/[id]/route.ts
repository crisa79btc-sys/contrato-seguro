/**
 * POST /api/reels/process/[id]
 *
 * Orquestrador do pipeline de Reels. Chamado em background por
 * /api/admin/reels/upload depois que o vídeo cru foi salvo no Storage.
 *
 * Sequência (cada passo atualiza reels_queue.status):
 *   1. transcribing  → Whisper (lib/reels/whisper.ts) gera segmentos+texto
 *   2. processing    → Claude Haiku (lib/reels/transcription-analyzer.ts) gera
 *                      título, descrição, hashtags, hook, cortes, thumbnail
 *   3. processing    → Shotstack (lib/reels/video-processor.ts) aplica
 *                      cortes, 9:16, legendas HTML, trilha → reels-ready/<id>.mp4
 *   4. processing    → thumbnail (lib/reels/thumbnail-generator.ts)
 *   5. ready         → reel fica aguardando revisão humana em /admin/reels/queue
 *
 * Auth: ADMIN_SECRET (o caller é /api/admin/reels/upload com Bearer).
 *
 * Erros em qualquer etapa marcam reels_queue.status='failed' + error_message.
 *
 * NOTA:
 *   - A signed URL do bucket reels-raw (1h de validade) é usada como input do
 *     Whisper (Replicate) e do Shotstack. Ambos aceitam URLs temporárias assinadas.
 *   - maxDuration=300 requer plano Vercel Pro. No Hobby o timeout cai para 60s.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/db/supabase';
import { transcribeAudio } from '@/lib/reels/whisper';
import { analyzeTranscription } from '@/lib/reels/transcription-analyzer';
import { processVideo } from '@/lib/reels/video-processor';
import { generateThumbnail } from '@/lib/reels/thumbnail-generator';
import { pickMusicTrack, trackPublicUrl } from '@/lib/reels/music-library';
import { optimizeInstagram, optimizeYoutube } from '@/lib/reels/hashtag-optimizer';
import type { ReelStatus } from '@/lib/reels/types';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 min (plano Pro). Em Hobby cai para 60s — o
                                // Sonnet deve validar o plano antes do go-live.

function authorized(request: NextRequest): boolean {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) return false;
  const auth = request.headers.get('authorization');
  return auth === `Bearer ${secret}`;
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!authorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const reelId = params.id;
  const admin = getAdminClient();

  // Helper para atualizar status sem quebrar o pipeline
  async function setStatus(status: ReelStatus, patch: Record<string, unknown> = {}) {
    await admin
      .from('reels_queue')
      .update({ status, ...patch })
      .eq('id', reelId);
  }
  async function setFailed(message: string) {
    console.error(`[reels/process/${reelId}] FAILED: ${message}`);
    await setStatus('failed', { error_message: message.slice(0, 500) });
  }

  // Buscar o reel
  const { data: reel, error: loadError } = await admin
    .from('reels_queue')
    .select('*')
    .eq('id', reelId)
    .single();

  if (loadError || !reel) {
    return NextResponse.json({ error: 'Reel não encontrado' }, { status: 404 });
  }

  try {
    // =====================================================================
    // 1. TRANSCREVER
    // =====================================================================
    await setStatus('transcribing');

    // Signed URL da raw (válida por 1h) — Replicate precisa de URL acessível.
    const { data: signed, error: signError } = await admin.storage
      .from('reels-raw')
      .createSignedUrl(reel.raw_storage_path, 3600);
    if (signError || !signed?.signedUrl) {
      throw new Error(`Não foi possível gerar signed URL: ${signError?.message}`);
    }
    const whisper = await transcribeAudio(signed.signedUrl);

    await admin
      .from('reels_queue')
      .update({
        transcription: whisper.text,
        duration_seconds: Math.ceil(whisper.duration),
      })
      .eq('id', reelId);

    // =====================================================================
    // 2. ANALISAR TRANSCRIÇÃO (Claude Haiku)
    // =====================================================================
    await setStatus('processing');

    const analysis = await analyzeTranscription(whisper.segments, reel.user_context);
    const a = analysis.analysis;

    const finalIgTags = optimizeInstagram(a.hashtags_instagram);
    const finalYtTags = optimizeYoutube(a.hashtags_youtube);

    await admin
      .from('reels_queue')
      .update({
        title: a.title,
        description: a.description,
        hashtags_instagram: finalIgTags,
        hashtags_youtube: finalYtTags,
        hook: `${a.hook_seconds[0]}-${a.hook_seconds[1]}s`,
        thumbnail_text: a.thumbnail_text,
        tokens_input: analysis.tokensInput,
        tokens_output: analysis.tokensOutput,
      })
      .eq('id', reelId);

    // =====================================================================
    // 3. PROCESSAR VÍDEO (FFmpeg Replicate)
    // =====================================================================
    const track = pickMusicTrack('serious');
    const musicUrl = trackPublicUrl(track);

    const videoResult = await processVideo({
      rawUrl: signed.signedUrl,
      cuts: a.cuts,
      segments: whisper.segments,
      musicUrl,
      outputName: `${reelId}.mp4`,
    });

    // Extrair o path dentro do bucket (o Sonnet pode ajustar conforme retorno do processVideo)
    const readyPath = `ready/${reelId}.mp4`;

    await admin
      .from('reels_queue')
      .update({
        ready_storage_path: readyPath,
        duration_seconds: Math.ceil(videoResult.durationSeconds),
      })
      .eq('id', reelId);

    // =====================================================================
    // 4. THUMBNAIL
    // =====================================================================
    const thumb = await generateThumbnail({
      readyVideoUrl: videoResult.outputUrl,
      momentSeconds: a.thumbnail_moment,
      text: a.thumbnail_text,
      reelId,
      admin,
    });

    await admin
      .from('reels_queue')
      .update({ thumbnail_path: thumb.storagePath })
      .eq('id', reelId);

    // =====================================================================
    // 5. READY
    // =====================================================================
    await setStatus('ready');

    return NextResponse.json({
      ok: true,
      reelId,
      title: a.title,
      thumbnailUrl: thumb.publicUrl,
      readyUrl: videoResult.outputUrl,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    await setFailed(msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
