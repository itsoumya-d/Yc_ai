import { NextRequest, NextResponse } from 'next/server';
import { handleStripeWebhook } from '@/lib/actions/billing';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature') ?? '';
  const result = await handleStripeWebhook(body, signature);
  if ('error' in result) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json(result);
}
