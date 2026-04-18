/**
 * Tipos do pipeline de Reels.
 * Espelham as colunas de reels_queue / reels_posts definidas em
 * docs/database/006_reels.sql.
 */

export type ReelStatus =
  | 'uploaded'
  | 'transcribing'
  | 'processing'
  | 'ready'
  | 'scheduled'
  | 'posting'
  | 'posted'
  | 'failed';

export type Platform = 'instagram' | 'facebook' | 'youtube';

/** Segmento de transcrição do Whisper com timestamps em segundos. */
export type TranscriptSegment = {
  start: number;
  end: number;
  text: string;
};

/** Resultado bruto do Whisper. */
export type WhisperResult = {
  text: string;
  language: string;
  duration: number;
  segments: TranscriptSegment[];
};

/** Trecho a remover (silêncio, "hmm", repetições). */
export type VideoCut = {
  start: number;
  end: number;
  reason: string;
};

/** Output da análise Claude sobre a transcrição — guia toda a edição e postagem. */
export type TranscriptionAnalysis = {
  title: string;                   // até 60 chars, hook forte
  description: string;             // 2-3 parágrafos + CTA para o site
  hashtags_instagram: string[];    // 10 hashtags
  hashtags_youtube: string[];      // 5 hashtags
  hook_seconds: [number, number];  // momento mais forte nos primeiros 10s
  cuts: VideoCut[];                // trechos a remover
  thumbnail_moment: number;        // segundo do frame para thumbnail
  thumbnail_text: string;          // overlay de até 4 palavras
};

/** Linha de reels_queue. */
export type ReelRow = {
  id: string;
  raw_storage_path: string;
  ready_storage_path: string | null;
  thumbnail_path: string | null;
  duration_seconds: number | null;
  raw_size_bytes: number | null;
  user_context: string | null;
  transcription: string | null;
  title: string | null;
  description: string | null;
  hashtags_instagram: string[] | null;
  hashtags_youtube: string[] | null;
  hook: string | null;
  thumbnail_text: string | null;
  status: ReelStatus;
  scheduled_for: string | null;
  error_message: string | null;
  tokens_input: number;
  tokens_output: number;
  processing_cost_usd: number;
  created_at: string;
  updated_at: string;
};

/** Linha de reels_posts. */
export type ReelPostRow = {
  id: string;
  reel_id: string;
  platform: Platform;
  platform_post_id: string | null;
  platform_url: string | null;
  posted_at: string | null;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  last_metrics_at: string | null;
  error_message: string | null;
};

/** Resultado padrão das funções de postagem. */
export type PostResult = {
  platform: Platform;
  success: boolean;
  platformPostId?: string;
  platformUrl?: string;
  error?: string;
};

/** Configuração de trilha sonora. */
export type MusicTrack = {
  id: string;
  filename: string;     // dentro de public/audio/
  mood: 'energetic' | 'calm' | 'serious' | 'uplifting';
  durationSeconds: number;
  attribution?: string; // para obrigações de crédito da licença
};
