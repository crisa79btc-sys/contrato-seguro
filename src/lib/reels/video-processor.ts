/**
 * Processamento de vídeo via Shotstack API.
 *
 * Por que Shotstack em vez de FFmpeg local?
 *   - FFmpeg binary (~60MB) não cabe em Vercel Function (50MB limit)
 *   - Shotstack é uma API declarativa de edição de vídeo (JSON → MP4)
 *   - Free tier: 20 min/mês → cobre 8-10 reels de 90s sem custo
 *   - Além do free: ~$0.04/min → ~R$0,25/reel, ainda baratíssimo
 *
 * Setup externo (uma vez):
 *   1. https://shotstack.io → criar conta gratuita
 *   2. https://dashboard.shotstack.io/account/api-keys → copiar Stage API Key
 *   3. Adicionar SHOTSTACK_API_KEY no Vercel (e .env.local)
 *   4. Quando pronto para produção: copiar Production API Key → SHOTSTACK_API_KEY_PROD
 *
 * Docs: https://shotstack.io/docs/guide/architecting-an-application/rendering-video/
 */

import { getAdminClient } from '@/lib/db/supabase';
import type { TranscriptSegment, VideoCut } from './types';

const SHOTSTACK_API = 'https://api.shotstack.io/stage'; // mudar para /v1 em produção

export type VideoProcessInput = {
  rawUrl: string;                  // URL pública ou signed URL do vídeo cru
  cuts: VideoCut[];                // trechos a remover (silêncios, hesitações)
  segments: TranscriptSegment[];   // para gerar legendas
  musicUrl: string;                // URL pública da trilha escolhida
  outputName: string;              // ex: "reel-<uuid>.mp4"
};

export type VideoProcessResult = {
  outputUrl: string;               // URL pública do vídeo final (bucket reels-ready)
  durationSeconds: number;
  sizeBytes: number;
};

function getApiKey(): string {
  const key = process.env.SHOTSTACK_API_KEY;
  if (!key) throw new Error('SHOTSTACK_API_KEY não configurado');
  return key;
}

/**
 * Gera um arquivo ASS (Advanced SubStation Alpha) com as legendas queimadas.
 * Estilo CapCut: Poppins Bold, branco com contorno preto, terço inferior.
 */
export function buildAssSubtitles(segments: TranscriptSegment[]): string {
  const header = `[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,Poppins,72,&H00FFFFFF,&H00000000,&H00000000,-1,0,0,0,100,100,0,0,1,6,2,2,60,60,200,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`;

  const events = segments
    .map(
      (s) =>
        `Dialogue: 0,${formatAssTime(s.start)},${formatAssTime(s.end)},Default,,0,0,0,,${escapeAss(s.text)}`
    )
    .join('\n');

  return header + events + '\n';
}

function formatAssTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h}:${m.toString().padStart(2, '0')}:${s.toFixed(2).padStart(5, '0')}`;
}

function escapeAss(text: string): string {
  return text.replace(/\n/g, '\\N').replace(/\{/g, '\\{');
}

/**
 * Dado uma lista de cuts e duração total, retorna os segmentos a MANTER.
 */
export function invertCuts(
  cuts: VideoCut[],
  durationTotal: number
): Array<{ start: number; end: number }> {
  if (cuts.length === 0) return [{ start: 0, end: durationTotal }];
  const sorted = [...cuts].sort((a, b) => a.start - b.start);
  const keep: Array<{ start: number; end: number }> = [];
  let cursor = 0;
  for (const cut of sorted) {
    if (cut.start > cursor) keep.push({ start: cursor, end: cut.start });
    cursor = Math.max(cursor, cut.end);
  }
  if (cursor < durationTotal) keep.push({ start: cursor, end: durationTotal });
  return keep;
}

/** Monta os clips Shotstack para cada segmento mantido. */
function buildVideoClips(
  rawUrl: string,
  keep: Array<{ start: number; end: number }>
): object[] {
  let timeline = 0;
  return keep.map((seg) => {
    const length = seg.end - seg.start;
    const clip = {
      asset: { type: 'video', src: rawUrl, trim: seg.start, volume: 1 },
      start: timeline,
      length,
    };
    timeline += length;
    return clip;
  });
}

/** Monta os clips de legenda (HTML overlay por segmento). */
function buildSubtitleClips(
  segments: TranscriptSegment[],
  keep: Array<{ start: number; end: number }>
): object[] {
  // Mapear timestamps originais para timestamps na timeline (após cortes)
  const clips: object[] = [];
  let timelineOffset = 0;
  let keepIdx = 0;

  for (const seg of segments) {
    // Avançar para o bloco de keep correspondente
    while (
      keepIdx < keep.length &&
      keep[keepIdx].end <= seg.start
    ) {
      timelineOffset += keep[keepIdx].end - keep[keepIdx].start;
      keepIdx++;
    }
    if (keepIdx >= keep.length) break;

    const block = keep[keepIdx];
    // Segmento dentro do bloco de keep?
    if (seg.end <= block.start || seg.start >= block.end) continue;

    const clampedStart = Math.max(seg.start, block.start);
    const clampedEnd = Math.min(seg.end, block.end);
    const tlStart = timelineOffset + (clampedStart - block.start);
    const tlLength = Math.max(0.1, clampedEnd - clampedStart);

    const text = seg.text.trim();
    if (!text) continue;

    // Escapar HTML para evitar quebra de layout com caracteres especiais
    const safeText = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');

    clips.push({
      asset: {
        type: 'html',
        html: `<p style="font-family:Arial,sans-serif;font-size:52px;font-weight:bold;color:#FFFFFF;text-align:center;text-shadow:4px 4px 8px #000,-4px -4px 8px #000,4px -4px 8px #000,-4px 4px 8px #000;padding:10px 20px;word-break:break-word;">${safeText}</p>`,
        width: 1000,
        height: 250,
        background: 'transparent',
      },
      // position e offset ficam no CLIP, não no asset (campo asset suporta apenas type/html/width/height/background)
      position: 'bottom',
      offset: { x: 0, y: 0.05 },
      start: tlStart,
      length: tlLength,
    });
  }

  return clips;
}

/**
 * Cria um render no Shotstack e aguarda o resultado (polling).
 * Timeout: 5 minutos.
 */
async function renderShotstack(timeline: object): Promise<string> {
  const key = getApiKey();

  const createRes = await fetch(`${SHOTSTACK_API}/render`, {
    method: 'POST',
    headers: {
      'x-api-key': key,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(timeline),
  });

  if (!createRes.ok) {
    throw new Error(`Shotstack create falhou: ${createRes.status} ${await createRes.text()}`);
  }

  const createData = (await createRes.json()) as {
    success: boolean;
    response?: { id: string };
    message?: string;
  };

  if (!createData.success || !createData.response?.id) {
    throw new Error(`Shotstack: ${createData.message ?? 'sem ID na resposta'}`);
  }

  const renderId = createData.response.id;

  // Polling — aguarda até 5 min
  const deadline = Date.now() + 300_000;
  while (Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, 5000));

    const statusRes = await fetch(`${SHOTSTACK_API}/render/${renderId}`, {
      headers: { 'x-api-key': key },
    });
    if (!statusRes.ok) continue;

    const statusData = (await statusRes.json()) as {
      success: boolean;
      response?: { status: string; url?: string };
    };

    const status = statusData.response?.status;
    if (status === 'done' && statusData.response?.url) {
      return statusData.response.url;
    }
    if (status === 'failed') {
      throw new Error('Shotstack: render falhou');
    }
  }

  throw new Error('Shotstack: timeout ao aguardar render (5min)');
}

/**
 * Processa o vídeo: corta silêncios, formata 9:16 1080×1920, adiciona
 * legendas e trilha de fundo, e salva no bucket reels-ready.
 */
export async function processVideo(input: VideoProcessInput): Promise<VideoProcessResult> {
  const durationTotal =
    input.segments.length > 0
      ? input.segments[input.segments.length - 1].end
      : 90;

  const keep = invertCuts(input.cuts, durationTotal);
  const finalDuration = keep.reduce((sum, s) => sum + (s.end - s.start), 0);

  const videoClips = buildVideoClips(input.rawUrl, keep);
  const subtitleClips = buildSubtitleClips(input.segments, keep);

  // Shotstack rejeita tracks com clips:[]. Só incluir legenda se existirem clips.
  const tracks: object[] = [{ clips: videoClips }];
  if (subtitleClips.length > 0) {
    tracks.unshift({ clips: subtitleClips }); // legenda fica acima do vídeo
  }

  const shotstackPayload = {
    timeline: {
      soundtrack: {
        src: input.musicUrl,
        effect: 'fadeOut',
        volume: 0.12,
      },
      tracks,
    },
    output: {
      format: 'mp4',
      resolution: '1080',
      aspectRatio: '9:16',
      fps: 30,
    },
  };

  // Render no Shotstack
  const shotstackUrl = await renderShotstack(shotstackPayload);

  // Baixar o vídeo processado e re-fazer upload no nosso Storage
  const videoRes = await fetch(shotstackUrl);
  if (!videoRes.ok) throw new Error(`Falha ao baixar vídeo do Shotstack: ${videoRes.status}`);
  const videoBuffer = await videoRes.arrayBuffer();

  const admin = getAdminClient();
  const storagePath = `ready/${input.outputName}`;

  const { error: uploadError } = await admin.storage
    .from('reels-ready')
    .upload(storagePath, new Uint8Array(videoBuffer), {
      contentType: 'video/mp4',
      upsert: true,
    });

  if (uploadError) throw new Error(`Upload Storage falhou: ${uploadError.message}`);

  const publicUrl = admin.storage
    .from('reels-ready')
    .getPublicUrl(storagePath).data.publicUrl;

  return {
    outputUrl: publicUrl,
    durationSeconds: Math.ceil(finalDuration),
    sizeBytes: videoBuffer.byteLength,
  };
}

/** @deprecated — mantido para compatibilidade, não é chamado no pipeline atual */
export function buildFfmpegCommand(params: {
  rawInput: string;
  cuts: VideoCut[];
  durationTotal: number;
  subtitleFile: string;
  musicInput: string;
}): string {
  const keep = invertCuts(params.cuts, params.durationTotal);
  const videoFilters = keep
    .map((seg, i) => `[0:v]trim=${seg.start}:${seg.end},setpts=PTS-STARTPTS[v${i}]`)
    .join(';');
  const audioFilters = keep
    .map((seg, i) => `[0:a]atrim=${seg.start}:${seg.end},asetpts=PTS-STARTPTS[a${i}]`)
    .join(';');
  const concatV =
    keep.map((_, i) => `[v${i}]`).join('') + `concat=n=${keep.length}:v=1:a=0[vcat]`;
  const concatA =
    keep.map((_, i) => `[a${i}]`).join('') + `concat=n=${keep.length}:v=0:a=1[acat]`;
  const scale9x16 =
    `[vcat]split[vmain][vbg];` +
    `[vbg]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,boxblur=20[bg];` +
    `[vmain]scale=1080:-2[main];` +
    `[bg][main]overlay=(W-w)/2:(H-h)/2[v9x16]`;
  const subs = `[v9x16]ass=${params.subtitleFile}[vfinal]`;
  const amix =
    `[1:a]volume=-20dB[music];` +
    `[acat][music]amix=inputs=2:duration=first:dropout_transition=2[amix];` +
    `[amix]loudnorm=I=-16:TP=-1.5:LRA=11[afinal]`;
  return [videoFilters, audioFilters, concatV, concatA, scale9x16, subs, amix].join(';');
}
