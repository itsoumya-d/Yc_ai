/**
 * In-memory sliding window rate limiter (per-instance).
 *
 * Note: For distributed deployments across multiple serverless instances,
 * replace with @upstash/ratelimit + @upstash/redis for coordinated limiting.
 */

const store = new Map<string, number[]>();

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number; // Unix timestamp (seconds) when the oldest entry expires
}

export function rateLimit(
  key: string,
  { max, windowMs }: { max: number; windowMs: number }
): RateLimitResult {
  const now = Date.now();
  const cutoff = now - windowMs;

  const hits = (store.get(key) ?? []).filter((t) => t > cutoff);
  const oldest = hits[0] ?? now;
  const reset = Math.ceil((oldest + windowMs) / 1000);

  if (hits.length >= max) {
    return { success: false, limit: max, remaining: 0, reset };
  }

  hits.push(now);
  store.set(key, hits);

  return { success: true, limit: max, remaining: max - hits.length, reset };
}

export function rateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    'X-RateLimit-Limit': String(result.limit),
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Reset': String(result.reset),
  };
}
