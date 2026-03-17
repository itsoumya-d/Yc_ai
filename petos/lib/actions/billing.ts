'use server';

import { createHmac, timingSafeEqual } from 'crypto';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';

const PADDLE_API_BASE = 'https://api.paddle.com';

async function paddleRequest<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${PADDLE_API_BASE}${path}`, {
    method,
    headers: { Authorization: `Bearer ${process.env.PADDLE_API_KEY}`, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(`Paddle API ${res.status}: ${JSON.stringify(err)}`);
  }
  return res.json() as Promise<T>;
}

export async function ensurePaddleCustomer(): Promise<string> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('profiles').select('paddle_customer_id').eq('id', user.id).single();
  if (profile?.paddle_customer_id) return profile.paddle_customer_id;

  const { data } = await paddleRequest<{ data: { id: string } }>('POST', '/customers', {
    email: user.email,
    name: user.user_metadata?.full_name,
  });

  await supabase.from('profiles').update({ paddle_customer_id: data.id }).eq('id', user.id);
  return data.id;
}

export async function cancelSubscription() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('profiles').select('paddle_subscription_id').eq('id', user.id).single();
  if (!profile?.paddle_subscription_id) redirect('/dashboard/settings/billing');

  await paddleRequest('POST', `/subscriptions/${profile.paddle_subscription_id}/cancel`, {
    effective_from: 'next_billing_period',
  });

  const origin = (await headers()).get('origin') ?? 'http://localhost:3000';
  redirect(`${origin}/dashboard/settings/billing?cancelled=1`);
}

export async function handlePaddleWebhook(rawBody: string, signature: string | null): Promise<{ error: string } | { received: true }> {
  if (!signature) return { error: 'Missing signature' };

  const parts = Object.fromEntries(signature.split(';').map((p) => p.split('=') as [string, string]));
  const { ts, h1 } = parts;
  if (!ts || !h1) return { error: 'Malformed signature' };

  if (Date.now() / 1000 - parseInt(ts, 10) > 300) return { error: 'Replay attack detected' };

  const expectedHash = createHmac('sha256', process.env.PADDLE_WEBHOOK_SECRET!).update(`${ts}:${rawBody}`).digest('hex');
  try {
    if (!timingSafeEqual(Buffer.from(h1), Buffer.from(expectedHash))) return { error: 'Invalid signature' };
  } catch {
    return { error: 'Invalid signature' };
  }

  const event = JSON.parse(rawBody) as { event_type: string; data: Record<string, unknown> };
  const supabase = await createClient();

  const priceEnvMap: Record<string, string> = {
    [process.env.PADDLE_PRICE_PRO_MONTHLY ?? '']: 'pro',
    [process.env.PADDLE_PRICE_PRO_ANNUAL ?? '']: 'pro',
    [process.env.PADDLE_PRICE_BUSINESS_MONTHLY ?? '']: 'business',
    [process.env.PADDLE_PRICE_BUSINESS_ANNUAL ?? '']: 'business',
  };

  if (event.event_type === 'subscription.activated' || event.event_type === 'subscription.created' || event.event_type === 'subscription.updated') {
    const data = event.data;
    const customerId = data['customer_id'] as string;
    const subscriptionId = data['id'] as string;
    const items = data['items'] as Array<{ price: { id: string } }>;
    const priceId = items?.[0]?.price?.id ?? '';
    const plan = priceEnvMap[priceId] ?? 'free';
    const nextBilledAt = data['next_billed_at'] as string | null;

    await supabase.from('profiles').update({
      plan,
      paddle_subscription_id: subscriptionId,
      paddle_subscription_status: data['status'] as string,
      plan_expires_at: nextBilledAt,
    }).eq('paddle_customer_id', customerId);
  }

  if (event.event_type === 'subscription.canceled') {
    const data = event.data;
    const subscriptionId = data['id'] as string;
    await supabase.from('profiles').update({
      plan: 'free',
      paddle_subscription_status: 'cancelled',
      plan_expires_at: null,
    }).eq('paddle_subscription_id', subscriptionId);
  }

  if (event.event_type === 'subscription.past_due') {
    const subscriptionId = event.data['id'] as string;
    await supabase.from('profiles').update({ paddle_subscription_status: 'past_due' }).eq('paddle_subscription_id', subscriptionId);
  }

  return { received: true };
}
