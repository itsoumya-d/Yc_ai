import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Create a Stripe Checkout session for subscribing to an author.
 * Requires STRIPE_SECRET_KEY env var.
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { authorId, priceId, authorName } = await request.json();
    if (!authorId || !priceId) {
      return NextResponse.json({ error: 'Missing authorId or priceId' }, { status: 400 });
    }

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://storythread.app';

    // Create Stripe Checkout session via REST API (no SDK needed)
    const params = new URLSearchParams({
      'mode': 'subscription',
      'payment_method_types[]': 'card',
      'line_items[0][price]': priceId,
      'line_items[0][quantity]': '1',
      'success_url': `${appUrl}/dashboard?subscribed=true`,
      'cancel_url': `${appUrl}/read/${authorId}`,
      'metadata[subscriber_id]': user.id,
      'metadata[author_id]': authorId,
      'customer_email': user.email ?? '',
    });

    const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${stripeSecretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    const session = await res.json();

    if (!res.ok) {
      return NextResponse.json({ error: session.error?.message ?? 'Stripe error' }, { status: 500 });
    }

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
