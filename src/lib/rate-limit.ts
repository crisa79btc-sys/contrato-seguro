/**
 * Rate limiter distribuído via Upstash Redis.
 * Sliding window por chave (geralmente IP).
 *
 * Requer as env vars UPSTASH_REDIS_REST_URL e UPSTASH_REDIS_REST_TOKEN
 * (criadas automaticamente ao conectar o Upstash ao projeto no Vercel).
 *
 * Em dev local sem Redis configurado, faz fallback para memória (best-effort).
 */

import { Redis } from '@upstash/redis';

const REDIS_AVAILABLE = !!(
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
);

let redis: Redis | null = null;
function getRedis(): Redis {
  if (!redis) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
  }
  return redis;
}

// Fallback em memória (dev local apenas — não persistido entre cold-starts)
type RateLimitEntry = { timestamps: number[] };
const memoryStores = new Map<string, Map<string, RateLimitEntry>>();

function getMemoryStore(name: string): Map<string, RateLimitEntry> {
  if (!memoryStores.has(name)) memoryStores.set(name, new Map());
  return memoryStores.get(name)!;
}

export async function checkRateLimit(opts: {
  name: string;
  key: string;
  maxRequests: number;
  windowSeconds: number;
}): Promise<{ allowed: true } | { allowed: false; retryAfter: number }> {
  const now = Date.now();
  const windowMs = opts.windowSeconds * 1000;

  if (REDIS_AVAILABLE) {
    try {
      const r = getRedis();
      const redisKey = `ratelimit:${opts.name}:${opts.key}`;
      const minScore = now - windowMs;

      await r.zremrangebyscore(redisKey, 0, minScore);
      const count = await r.zcard(redisKey);

      if (count >= opts.maxRequests) {
        const oldest = await r.zrange(redisKey, 0, 0, { withScores: true });
        const oldestScore = oldest[1] ? Number(oldest[1]) : now;
        const retryAfter = Math.max(Math.ceil((oldestScore + windowMs - now) / 1000), 1);
        return { allowed: false, retryAfter };
      }

      await r.zadd(redisKey, { score: now, member: `${now}-${Math.random()}` });
      await r.expire(redisKey, Math.ceil(opts.windowSeconds * 2));
      return { allowed: true };
    } catch (err) {
      console.error('[rate-limit] Redis erro, usando fallback de memória:', err);
    }
  }

  // Fallback em memória
  const store = getMemoryStore(opts.name);
  let entry = store.get(opts.key);
  if (!entry) {
    entry = { timestamps: [] };
    store.set(opts.key, entry);
  }
  entry.timestamps = entry.timestamps.filter((t) => now - t < windowMs);
  if (entry.timestamps.length >= opts.maxRequests) {
    const oldest = entry.timestamps[0]!;
    const retryAfter = Math.ceil((oldest + windowMs - now) / 1000);
    return { allowed: false, retryAfter };
  }
  entry.timestamps.push(now);
  return { allowed: true };
}

/** Extrai IP real do request. Pega a última entry do x-forwarded-for (mais próxima do LB) para evitar spoofing. */
export function getClientIp(request: Request): string {
  const headers = request.headers;
  const xff = headers.get('x-forwarded-for');
  if (xff) {
    const ips = xff.split(',').map((ip) => ip.trim()).filter(Boolean);
    if (ips.length > 0) return ips[ips.length - 1]!;
  }
  return headers.get('x-real-ip') || 'unknown';
}
