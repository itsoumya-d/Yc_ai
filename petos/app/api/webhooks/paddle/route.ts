import { NextRequest, NextResponse } from 'next/server';
import { handlePaddleWebhook } from '@/lib/actions/billing';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('paddle-signature');
  const result = await handlePaddleWebhook(body, signature);
  if ('error' in result) return NextResponse.json({ error: result.error }, { status: 401 });
  return NextResponse.json(result);
}
