import { updateSession } from '@/lib/supabase/middleware';
import type { NextRequest } from 'next/server';
import { checkRateLimit, rateLimitResponse } from '@/lib/rate-limit';

export async function proxy(request: NextRequest) {
  // ── Rate limiting ──────────────────────────────────────────────────────────
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    '127.0.0.1';
  const path = request.nextUrl.pathname;
  const isApiRoute = path.startsWith('/api/');
  const isAuthRoute =
    path.startsWith('/api/auth') || path === '/login' || path === '/signup';
  const isWebhook = path.includes('/webhooks/');

  if (isApiRoute && !isWebhook) {
    const limit = isAuthRoute ? 10 : 100;
    const rl = checkRateLimit(
      `${ip}:${isAuthRoute ? 'auth' : 'api'}`,
      limit,
      60_000,
    );
    if (!rl.success) return rateLimitResponse(rl.reset, rl.limit);
  }

  return await updateSession(request);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
