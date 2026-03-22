import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const start = Date.now();
  const checks: Record<string, string> = {};

  try {
    const supabase = await createClient();
    const { error } = await supabase.from('profiles').select('id').limit(1);
    checks.database = error ? `error: ${error.message}` : 'ok';
  } catch {
    checks.database = 'unreachable';
  }

  checks.stripe = process.env.STRIPE_SECRET_KEY ? 'configured' : 'missing_key';

  const allOk = Object.values(checks).every((v) => v === 'ok' || v === 'configured');
  const status = allOk ? 200 : 503;

  return NextResponse.json(
    {
      status: allOk ? 'ok' : 'degraded',
      app: 'PetOS',
      version: process.env.npm_package_version ?? '1.0.0',
      timestamp: new Date().toISOString(),
      latencyMs: Date.now() - start,
      checks,
    },
    { status }
  );
}
