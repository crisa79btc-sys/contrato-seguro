const APP_URL = (process.env.NEXT_PUBLIC_APP_URL || 'https://contrato-seguro-inky.vercel.app').trim();

type UtmSource = 'instagram' | 'facebook' | 'youtube';
type UtmMedium = 'post' | 'carousel' | 'reel' | 'story';

export function buildUtmUrl(opts: {
  source: UtmSource;
  medium: UtmMedium;
  campaign: string;
}): string {
  const params = new URLSearchParams({
    utm_source: opts.source,
    utm_medium: opts.medium,
    utm_campaign: opts.campaign,
  });
  return `${APP_URL}?${params.toString()}`;
}
