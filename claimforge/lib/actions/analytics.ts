'use server';

import { createClient } from '@/lib/supabase/server';

export interface MonthlyMetric {
  month: string;  // "Jan", "Feb", etc.
  submitted: number;
  approved: number;
  denied: number;
}

export interface ClaimTypeMetric {
  type: string;
  count: number;
  value: number;
  approvalRate: number;
}

export interface ProcessingTimeMetric {
  range: string;
  count: number;
  pct: number;
}

export interface AnalyticsData {
  monthly: MonthlyMetric[];
  claimTypes: ClaimTypeMetric[];
  processingTimes: ProcessingTimeMetric[];
  totalClaims: number;
  totalValue: number;
  avgApprovalRate: number;
}

export async function getAnalyticsData(): Promise<{ data?: AnalyticsData; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  // Fetch all user claims — we aggregate in JS to avoid requiring DB functions
  const { data: claims, error } = await supabase
    .from('claims')
    .select('id, claim_type, status, estimated_amount, approved_amount, created_at')
    .eq('claimant_id', user.id)
    .order('created_at', { ascending: true });

  if (error) return { error: error.message };
  if (!claims || claims.length === 0) {
    return {
      data: {
        monthly: [],
        claimTypes: [],
        processingTimes: [],
        totalClaims: 0,
        totalValue: 0,
        avgApprovalRate: 0,
      },
    };
  }

  // ── Monthly aggregation (last 12 months) ──────────────────────────────────
  const now = new Date();
  const monthlyMap: Record<string, { submitted: number; approved: number; denied: number }> = {};

  // Initialise last 12 months
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    monthlyMap[key] = { submitted: 0, approved: 0, denied: 0 };
  }

  for (const claim of claims) {
    const d = new Date(claim.created_at);
    const key = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    if (!monthlyMap[key]) continue;
    monthlyMap[key].submitted++;
    if (claim.status === 'approved' || claim.status === 'closed') monthlyMap[key].approved++;
    if (claim.status === 'denied' || claim.status === 'rejected') monthlyMap[key].denied++;
  }

  const monthly: MonthlyMetric[] = Object.entries(monthlyMap).map(([month, v]) => ({
    month: month.split(' ')[0], // Just "Jan", "Feb", etc.
    ...v,
  }));

  // ── Claim type aggregation ─────────────────────────────────────────────────
  const typeMap: Record<string, { count: number; value: number; approved: number }> = {};

  for (const claim of claims) {
    const type = claim.claim_type ?? 'Other';
    if (!typeMap[type]) typeMap[type] = { count: 0, value: 0, approved: 0 };
    typeMap[type].count++;
    typeMap[type].value += Number(claim.estimated_amount ?? 0);
    if (claim.status === 'approved' || claim.status === 'closed') typeMap[type].approved++;
  }

  const claimTypes: ClaimTypeMetric[] = Object.entries(typeMap).map(([type, v]) => ({
    type: type.charAt(0).toUpperCase() + type.slice(1),
    count: v.count,
    value: Math.round(v.value),
    approvalRate: v.count > 0 ? Math.round((v.approved / v.count) * 100) : 0,
  }));

  // ── Processing time distribution ───────────────────────────────────────────
  // We approximate "processing time" as days since creation for resolved claims
  const resolvedStatuses = ['approved', 'denied', 'closed', 'rejected', 'settled'];
  const resolvedClaims = claims.filter(c => resolvedStatuses.includes(c.status ?? ''));

  // Without a resolved_at timestamp we use a proxy: distance from created_at
  // to now (capped to reasonable ranges). Production would use a resolved_at column.
  const buckets = [
    { label: '1-3 days', min: 0, max: 3 },
    { label: '4-7 days', min: 4, max: 7 },
    { label: '8-14 days', min: 8, max: 14 },
    { label: '15-30 days', min: 15, max: 30 },
    { label: '30+ days', min: 31, max: Infinity },
  ];

  const bucketCounts = buckets.map(() => 0);
  for (const claim of resolvedClaims) {
    const days = Math.floor((now.getTime() - new Date(claim.created_at).getTime()) / 86_400_000);
    for (let i = 0; i < buckets.length; i++) {
      if (days >= buckets[i].min && days <= buckets[i].max) {
        bucketCounts[i]++;
        break;
      }
    }
  }

  const resolvedTotal = resolvedClaims.length || 1;
  const processingTimes: ProcessingTimeMetric[] = buckets.map((b, i) => ({
    range: b.label,
    count: bucketCounts[i],
    pct: Math.round((bucketCounts[i] / resolvedTotal) * 100),
  }));

  // ── Summary stats ──────────────────────────────────────────────────────────
  const totalClaims = claims.length;
  const totalValue = claims.reduce((s, c) => s + Number(c.estimated_amount ?? 0), 0);
  const approved = claims.filter(c => c.status === 'approved' || c.status === 'closed').length;
  const avgApprovalRate = totalClaims > 0 ? Math.round((approved / totalClaims) * 100) : 0;

  return {
    data: {
      monthly,
      claimTypes,
      processingTimes,
      totalClaims,
      totalValue: Math.round(totalValue),
      avgApprovalRate,
    },
  };
}
