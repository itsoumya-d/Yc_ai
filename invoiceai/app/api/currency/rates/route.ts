import { NextRequest, NextResponse } from 'next/server';

// Cache exchange rates in memory (revalidated via Next.js ISR every 24h)
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours
let cachedRates: { rates: Record<string, number>; timestamp: number } | null = null;

// Fallback rates relative to USD (used if external API unavailable)
const FALLBACK_RATES: Record<string, number> = {
  USD: 1, EUR: 0.92, GBP: 0.79, CAD: 1.36, AUD: 1.53, INR: 83.12,
  JPY: 149.5, CNY: 7.24, CHF: 0.89, SGD: 1.34, HKD: 7.82,
  NZD: 1.63, MXN: 17.15, BRL: 4.97, AED: 3.67,
};

export async function GET(request: NextRequest) {
  const base = request.nextUrl.searchParams.get('base') || 'USD';

  // Return cached rates if fresh
  if (cachedRates && Date.now() - cachedRates.timestamp < CACHE_TTL) {
    return NextResponse.json({ rates: cachedRates.rates, base, cached: true });
  }

  try {
    // Use Open Exchange Rates (free tier) or fallback
    // In production, set EXCHANGE_RATES_API_KEY in env
    const apiKey = process.env.EXCHANGE_RATES_API_KEY;
    if (apiKey) {
      const res = await fetch(
        `https://openexchangerates.org/api/latest.json?app_id=${apiKey}&base=USD`,
        { next: { revalidate: 86400 } }
      );
      if (res.ok) {
        const data = await res.json();
        cachedRates = { rates: data.rates, timestamp: Date.now() };
        return NextResponse.json({ rates: data.rates, base: 'USD', cached: false });
      }
    }

    // Fallback to hardcoded rates
    cachedRates = { rates: FALLBACK_RATES, timestamp: Date.now() };
    return NextResponse.json({ rates: FALLBACK_RATES, base: 'USD', cached: false, fallback: true });
  } catch {
    return NextResponse.json({ rates: FALLBACK_RATES, base: 'USD', fallback: true });
  }
}
