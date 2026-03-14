import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe/client";

const PRICE_MAP: Record<string, string> = {
  navigator: process.env.STRIPE_PRICE_NAVIGATOR || "",
  pro: process.env.STRIPE_PRICE_PRO || "",
};

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { plan } = await request.json() as { plan: string };
  const priceId = PRICE_MAP[plan];
  if (!priceId) return NextResponse.json({ error: "Invalid plan" }, { status: 400 });

  const stripe = getStripe();
  const origin = request.headers.get("origin") || "http://localhost:3000";

  const { data: sub } = await supabase
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .single();

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    customer: sub?.stripe_customer_id || undefined,
    customer_email: !sub?.stripe_customer_id ? user.email : undefined,
    metadata: { user_id: user.id, plan },
    success_url: `${origin}/settings?session_id={CHECKOUT_SESSION_ID}&success=true`,
    cancel_url: `${origin}/settings?canceled=true`,
  });

  return NextResponse.json({ url: session.url });
}
