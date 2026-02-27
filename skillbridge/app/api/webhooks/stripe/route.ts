import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe/client";
import Stripe from "stripe";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error("Webhook signature error:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = createServiceClient();

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.user_id;
    const plan = session.metadata?.plan;
    if (!userId || !plan) return NextResponse.json({ received: true });

    const sub = session.subscription
      ? await getStripe().subscriptions.retrieve(session.subscription as string)
      : null;

    await supabase.from("subscriptions").upsert({
      user_id: userId,
      stripe_customer_id: session.customer as string,
      stripe_subscription_id: session.subscription as string,
      plan,
      status: "active",
      current_period_end: sub
        ? new Date((sub as unknown as { current_period_end?: number }).current_period_end! * 1000).toISOString()
        : null,
    }, { onConflict: "user_id" });
  }

  if (event.type === "customer.subscription.updated") {
    const sub = event.data.object as Stripe.Subscription;
    const userId = sub.metadata?.user_id;
    if (!userId) return NextResponse.json({ received: true });

    await supabase.from("subscriptions").update({
      status: sub.status as string,
      current_period_end: new Date((sub as unknown as { current_period_end?: number }).current_period_end! * 1000).toISOString(),
    }).eq("stripe_subscription_id", sub.id);
  }

  if (event.type === "customer.subscription.deleted") {
    const sub = event.data.object as Stripe.Subscription;
    await supabase.from("subscriptions").update({
      plan: "free",
      status: "cancelled",
      stripe_subscription_id: null,
    }).eq("stripe_subscription_id", sub.id);
  }

  if (event.type === "invoice.payment_failed") {
    const invoice = event.data.object as Stripe.Invoice;
    const subId = typeof invoice.subscription === "string" ? invoice.subscription : null;
    if (subId) {
      await supabase.from("subscriptions").update({ status: "past_due" }).eq("stripe_subscription_id", subId);
    }
  }

  return NextResponse.json({ received: true });
}
