/**
 * Rate limiter em memória para serverless (Vercel).
 *
 * Usa sliding window por IP. Em serverless, cada instância tem sua
 * própria memória, então o limite é por instância — mas ainda protege
 * contra abuso básico (um único IP bombardeando a mesma instância).
 *
 * Para rate limiting distribuído (multi-instância), usar Vercel KV ou Upstash.
 */

type RateLimitEntry = {
  timestamps: number[];
};

const stores = new Map<string, Map<string, RateLimitEntry>>();

function getStore(name: string): Map<string, RateLimitEntry> {
  if (!stores.has(name)) {
    stores.set(name, new Map());
  }
  return stores.get(name)!;
}

/**
 * Verifica rate limit para um identificador (geralmente IP).
 * @returns { allowed: true } se dentro do limite, ou { allowed: false, retryAfter } se excedeu.
 */
export function checkRateLimit(opts: {
  /** Nome do rate limiter (ex: 'upload', 'correct') */
  name: string;
  /** Identificador único (ex: IP do cliente) */
  key: string;
  /** Máximo de requests permitidos na janela */
  maxRequests: number;
  /** Janela de tempo em segundos */
  windowSeconds: number;
}): { allowed: true } | { allowed: false; retryAfter: number } {
  const store = getStore(opts.name);
  const now = Date.now();
  const windowMs = opts.windowSeconds * 1000;

  let entry = store.get(opts.key);
  if (!entry) {
    entry = { timestamps: [] };
    store.set(opts.key, entry);
  }

  // Remover timestamps fora da janela
  entry.timestamps = entry.timestamps.filter(t => now - t < windowMs);

  if (entry.timestamps.length >= opts.maxRequests) {
    const oldest = entry.timestamps[0];
    const retryAfter = Math.ceil((oldest + windowMs - now) / 1000);
    return { allowed: false, retryAfter };
  }

  entry.timestamps.push(now);

  // Limpeza periódica de keys antigas (a cada 100 checks)
  if (Math.random() < 0.01) {
    for (const [key, val] of store.entries()) {
      if (val.timestamps.length === 0 || now - val.timestamps[val.timestamps.length - 1] > windowMs * 2) {
        store.delete(key);
      }
    }
  }

  return { allowed: true };
}

/** Extrai IP do request (Vercel headers) */
export function getClientIp(request: Request): string {
  const headers = request.headers;
  return (
    headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    headers.get('x-real-ip') ||
    'unknown'
  );
}
