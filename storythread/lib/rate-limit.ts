/**
 * Lightweight sliding-window rate limiter for Next.js Edge middleware.
 *
 * Uses an in-memory Map — works within a single serverless instance.
 * For multi-region production, swap for Upstash Redis:
 *   https://github.com/upstash/ratelimit
 *
 * Usage in middleware.ts:
 *   const { success, remaining, reset } = checkRateLimit(ip, 'api', 100, 60_000);
 *   if (!success) return rateLimitResponse(reset);
 */

interface WindowEntry {
  count: number;
  windowStart: number;
}

// LRU-lite: evict entries older than 5 minutes to bound memory
const store = new Map<string, WindowEntry>();
const EVICT_INTERVAL_MS = 5 * 60 * 1000;
let lastEviction = Date.now();

function evictStale(windowMs: number) {
  const now = Date.now();
  if (now - lastEviction < EVICT_INTERVAL_MS) return;
  lastEviction = now;
  for (const [key, entry] of store) {
    if (now - entry.windowStart > windowMs * 2) store.delete(key);
  }
}

export interface RateLimitResult {
  success: boolean;  // true = request allowed
  remaining: number; // requests remaining in window
  reset: number;     // unix ms when window resets
  limit: number;     // total limit per window
}

/**
 * @param identifier  Unique key (e.g. `${ip}:${route}`)
 * @param limit       Max requests per window
 * @param windowMs    Window size in milliseconds (default: 60,000 = 1 min)
 */
export function checkRateLimit(
  identifier: string,
  limit: number,
  windowMs = 60_000
): RateLimitResult {
  evictStale(windowMs);
  const now = Date.now();
  const entry = store.get(identifier);

  if (!entry || now - entry.windowStart >= windowMs) {
    // Start new window
    store.set(identifier, { count: 1, windowStart: now });
    return { success: true, remaining: limit - 1, reset: now + windowMs, limit };
  }

  entry.count++;
  const remaining = Math.max(0, limit - entry.count);
  const reset = entry.windowStart + windowMs;

  return { success: entry.count <= limit, remaining, reset, limit };
}

/** Returns a 429 response with standard rate-limit headers. */
export function rateLimitResponse(reset: number, limit: number): Response {
  return new Response(
    JSON.stringify({ error: 'Too many requests. Please slow down.' }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': String(Math.ceil((reset - Date.now()) / 1000)),
        'X-RateLimit-Limit': String(limit),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': String(Math.ceil(reset / 1000)),
      },
    }
  );
}

/** Adds rate-limit headers to an existing NextResponse. */
export function addRateLimitHeaders(
  headers: Headers,
  result: RateLimitResult
): void {
  headers.set('X-RateLimit-Limit', String(result.limit));
  headers.set('X-RateLimit-Remaining', String(result.remaining));
  headers.set('X-RateLimit-Reset', String(Math.ceil(result.reset / 1000)));
}

// ---------------------------------------------------------------------------
// Simple functional helpers — compatible with the Task 3 AI route pattern
// ---------------------------------------------------------------------------

interface SimpleLimitEntry {
  count: number;
  resetAt: number;
}

const simpleStore = new Map<string, SimpleLimitEntry>();

interface SimpleLimitOptions {
  windowMs?: number;
  max?: number;
}

interface SimpleLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number;
}

export function rateLimit(
  identifier: string,
  options: SimpleLimitOptions = {}
): SimpleLimitResult {
  const { windowMs = 60_000, max = 10 } = options;
  const now = Date.now();

  // Clean up expired entries periodically
  if (Math.random() < 0.01) {
    for (const [key, entry] of simpleStore.entries()) {
      if (entry.resetAt < now) simpleStore.delete(key);
    }
  }

  const entry = simpleStore.get(identifier);

  if (!entry || entry.resetAt < now) {
    simpleStore.set(identifier, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: max - 1, resetAt: now + windowMs };
  }

  entry.count++;

  if (entry.count > max) {
    return { success: false, remaining: 0, resetAt: entry.resetAt };
  }

  return { success: true, remaining: max - entry.count, resetAt: entry.resetAt };
}

export const aiRateLimit = (ip: string) =>
  rateLimit(`ai:${ip}`, { windowMs: 60_000, max: 5 });    // 5 AI calls/min

export const apiRateLimit = (ip: string) =>
  rateLimit(`api:${ip}`, { windowMs: 60_000, max: 60 });   // 60 API calls/min

export const authRateLimit = (ip: string) =>
  rateLimit(`auth:${ip}`, { windowMs: 15 * 60_000, max: 10 }); // 10 auth attempts/15min

export function getRateLimitHeaders(result: SimpleLimitResult, max: number) {
  return {
    'X-RateLimit-Limit': String(max),
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Reset': String(Math.ceil(result.resetAt / 1000)),
  };
}
