import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { analyzeDeal } from '@/lib/actions/ai';
import { rateLimit, rateLimitHeaders } from '@/lib/rate-limit';

// Thin API wrapper around the server action for client-side use
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const rl = rateLimit(`ai:${user.id}`, { max: 10, windowMs: 60_000 });
  if (!rl.success) {
    const retryAfter = Math.max(0, rl.reset - Math.floor(Date.now() / 1000));
    return NextResponse.json(
      { error: 'Too many requests. Please wait before analyzing again.' },
      { status: 429, headers: { ...rateLimitHeaders(rl), 'Retry-After': String(retryAfter) } }
    );
  }

  const result = await analyzeDeal(id);

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({ prediction: result.data }, { headers: rateLimitHeaders(rl) });
}
