import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') ?? '30d'; // '7d' | '30d' | '90d' | '1y'

    const periodDays: Record<string, number> = { '7d': 7, '30d': 30, '90d': 90, '1y': 365 };
    const days = periodDays[period] ?? 30;
    const since = new Date(Date.now() - days * 24 * 3600 * 1000).toISOString();

    const { data: claims, error } = await supabase
      .from('claims')
      .select('id, status, claim_type, amount, created_at, resolved_at, fraud_risk_level')
      .eq('user_id', user.id)
      .gte('created_at', since)
      .order('created_at', { ascending: true });

    if (error) throw error;

    const all = claims ?? [];

    // Volume by status
    const byStatus = all.reduce((acc, c) => {
      acc[c.status] = (acc[c.status] ?? 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Volume by type
    const byType = all.reduce((acc, c) => {
      const t = c.claim_type ?? 'unknown';
      acc[t] = (acc[t] ?? 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Total claimed amount
    const total_amount = all.reduce((sum, c) => sum + (c.amount ?? 0), 0);

    // Average resolution time (days)
    const resolved = all.filter((c) => c.resolved_at && c.created_at);
    const avg_resolution_days =
      resolved.length > 0
        ? resolved.reduce((sum, c) => {
            const diff =
              (new Date(c.resolved_at!).getTime() - new Date(c.created_at).getTime()) /
              (24 * 3600 * 1000);
            return sum + diff;
          }, 0) / resolved.length
        : null;

    // Fraud risk distribution
    const byFraudRisk = all.reduce((acc, c) => {
      const r = c.fraud_risk_level ?? 'unscored';
      acc[r] = (acc[r] ?? 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Weekly volume trend
    const weeklyTrend: { week: string; count: number; amount: number }[] = [];
    for (let i = Math.ceil(days / 7) - 1; i >= 0; i--) {
      const start = new Date(Date.now() - (i + 1) * 7 * 24 * 3600 * 1000);
      const end = new Date(Date.now() - i * 7 * 24 * 3600 * 1000);
      const week = all.filter(
        (c) => new Date(c.created_at) >= start && new Date(c.created_at) < end
      );
      weeklyTrend.push({
        week: start.toISOString().slice(0, 10),
        count: week.length,
        amount: week.reduce((s, c) => s + (c.amount ?? 0), 0),
      });
    }

    return NextResponse.json({
      period,
      total_claims: all.length,
      total_amount,
      avg_resolution_days: avg_resolution_days ? Math.round(avg_resolution_days * 10) / 10 : null,
      by_status: byStatus,
      by_type: byType,
      by_fraud_risk: byFraudRisk,
      weekly_trend: weeklyTrend,
      computed_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[Analytics Trends]', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Analytics failed' },
      { status: 500 }
    );
  }
}
