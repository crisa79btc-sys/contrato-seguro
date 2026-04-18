/**
 * Otimizador de hashtags — estratégia 3-tier (HIGH/MID/NICHE).
 *
 * HIGH (100K+ posts): reach amplo, concorrência alta
 * MID (10K-100K): equilíbrio entre alcance e relevância
 * NICHE (1K-10K): relevância máxima, pouca competição
 */

const BRAND_TAGS = ['contratoseguro'];

const HIGH_VOLUME_PT = [
  'direito',
  'direitosdoconsumidor',
  'brasil',
  'dicasjuridicas',
];

const MID_VOLUME_PT = [
  'contratos',
  'direitotrabalhista',
  'direitocivil',
  'advocacia',
  'consumidor',
];

const NICHE_PT = [
  'contratoseguro',
  'direitocontratual',
  'clausulasabusivas',
  'analisedecontrato',
  'protecaocontratual',
  'direitosdopovo',
];

const INSTAGRAM_MAX = 12;
const YOUTUBE_MAX = 5;

function pick<T>(arr: T[], n: number): T[] {
  const copy = [...arr];
  const result: T[] = [];
  for (let i = 0; i < n && copy.length > 0; i++) {
    const idx = Math.floor(Math.random() * copy.length);
    result.push(copy.splice(idx, 1)[0]!);
  }
  return result;
}

/**
 * Seleciona hashtags em 3 camadas para melhor distribuição de alcance.
 * Pode forçar inclusão de hashtags temáticas específicas.
 */
export function pickHashtags(opts: {
  count?: number;
  forceInclude?: string[];
} = {}): string[] {
  const count = opts.count ?? INSTAGRAM_MAX;
  const selected = [
    ...pick(HIGH_VOLUME_PT, 3),
    ...pick(MID_VOLUME_PT, 4),
    ...pick(NICHE_PT, 4),
  ];
  const forced = (opts.forceInclude ?? []).map((h) => h.replace(/^#/, ''));
  const all = Array.from(new Set([...forced, ...selected])).slice(0, count);
  return all.map((h) => `#${h}`);
}

/** Combina hashtags geradas pelo Claude com as base — mantém compatibilidade legada. */
export function optimizeInstagram(generated: string[]): string[] {
  const themed = generated.map((h) => h.replace(/^#/, ''));
  return pickHashtags({ forceInclude: themed });
}

export function optimizeYoutube(generated: string[]): string[] {
  const themed = generated.map((h) => h.replace(/^#/, '')).slice(0, 2);
  const all = Array.from(new Set(['contratoseguro', 'contratos', 'direito', ...themed])).slice(0, YOUTUBE_MAX);
  return all.map((h) => `#${h}`);
}

/**
 * Formata hashtags para colar no final de uma descrição.
 */
export function formatHashtagsInline(tags: string[]): string {
  return tags.map((t) => (t.startsWith('#') ? t : `#${t}`)).join(' ');
}

export { BRAND_TAGS };
