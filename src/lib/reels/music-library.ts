/**
 * Biblioteca de trilhas sonoras royalty-free para os Reels.
 *
 * Arquivos vivem em public/audio/ (servidos diretamente pelo Vercel via URL pública).
 *
 * ⚠️ SETUP MANUAL: o usuário deve baixar as 10 trilhas listadas aqui e colocar
 * em public/audio/. Todas são CC0 ou licenças que permitem uso comercial sem
 * atribuição. Fontes recomendadas:
 *   - https://pixabay.com/music/ (filtrar por licença, duration 30-90s)
 *   - https://freesound.org/ (CC0)
 *   - https://www.chosic.com/free-music/
 *
 * Critério de seleção: instrumental, BPM moderado (90-110), sem vocais,
 * compatível com voz-over falada.
 */

import type { MusicTrack } from './types';

export const MUSIC_LIBRARY: MusicTrack[] = [
  {
    id: 'corporate-serious-1',
    filename: 'corporate-serious-1.mp3',
    mood: 'serious',
    durationSeconds: 90,
  },
  {
    id: 'corporate-uplifting-1',
    filename: 'corporate-uplifting-1.mp3',
    mood: 'uplifting',
    durationSeconds: 90,
  },
  {
    id: 'ambient-calm-1',
    filename: 'ambient-calm-1.mp3',
    mood: 'calm',
    durationSeconds: 90,
  },
  {
    id: 'energetic-tech-1',
    filename: 'energetic-tech-1.mp3',
    mood: 'energetic',
    durationSeconds: 90,
  },
  {
    id: 'corporate-serious-2',
    filename: 'corporate-serious-2.mp3',
    mood: 'serious',
    durationSeconds: 90,
  },
  {
    id: 'corporate-uplifting-2',
    filename: 'corporate-uplifting-2.mp3',
    mood: 'uplifting',
    durationSeconds: 90,
  },
  {
    id: 'ambient-calm-2',
    filename: 'ambient-calm-2.mp3',
    mood: 'calm',
    durationSeconds: 90,
  },
  {
    id: 'energetic-tech-2',
    filename: 'energetic-tech-2.mp3',
    mood: 'energetic',
    durationSeconds: 90,
  },
  {
    id: 'corporate-neutral-1',
    filename: 'corporate-neutral-1.mp3',
    mood: 'serious',
    durationSeconds: 90,
  },
  {
    id: 'corporate-neutral-2',
    filename: 'corporate-neutral-2.mp3',
    mood: 'uplifting',
    durationSeconds: 90,
  },
];

/**
 * Escolhe uma trilha aleatoriamente, preferindo o mood indicado.
 * Fallback: qualquer trilha disponível.
 */
export function pickMusicTrack(preferredMood?: MusicTrack['mood']): MusicTrack {
  const candidates = preferredMood
    ? MUSIC_LIBRARY.filter((t) => t.mood === preferredMood)
    : MUSIC_LIBRARY;
  const pool = candidates.length > 0 ? candidates : MUSIC_LIBRARY;
  return pool[Math.floor(Math.random() * pool.length)];
}

/**
 * URL pública da trilha (servida por /audio/<filename> do Next).
 * Requer NEXT_PUBLIC_SITE_URL configurado.
 */
export function trackPublicUrl(track: MusicTrack): string {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    'https://contrato-seguro-inky.vercel.app';
  return `${base.replace(/\/$/, '')}/audio/${track.filename}`;
}
