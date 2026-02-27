'use server';

import { createClient } from '@/lib/supabase/server';
import type { ActionResult, Bill, BillLineItem } from '@/types/database';

interface BillAnalysis {
  bill: Bill;
  lineItems: BillLineItem[];
  totalOvercharge: number;
  overchargeCount: number;
}

export async function fetchBillAnalysis(billId: string): Promise<ActionResult<BillAnalysis>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Not authenticated' };

  const [billRes, itemsRes] = await Promise.all([
    supabase.from('bills').select('*').eq('id', billId).eq('user_id', user.id).single(),
    supabase.from('bill_line_items').select('*').eq('bill_id', billId).order('created_at'),
  ]);

  if (billRes.error) return { success: false, error: billRes.error.message };

  const lineItems = itemsRes.data ?? [];
  const overcharges = lineItems.filter((item) => item.is_overcharge);

  return {
    success: true,
    data: {
      bill: billRes.data,
      lineItems,
      totalOvercharge: overcharges.reduce((sum, item) => {
        const fair = item.fair_amount_cents ?? item.charged_amount_cents;
        return sum + (item.charged_amount_cents - fair);
      }, 0),
      overchargeCount: overcharges.length,
    },
  };
}

interface OverchargeItem {
  id: string;
  description: string;
  charged: number;
  fair: number;
  difference: number;
  reason: string | null;
  explanation: string | null;
  confidence: number | null;
}

export async function fetchOvercharges(billId: string): Promise<ActionResult<OverchargeItem[]>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('bill_line_items')
    .select('*')
    .eq('bill_id', billId)
    .eq('is_overcharge', true)
    .order('charged_amount_cents', { ascending: false });

  if (error) return { success: false, error: error.message };

  const overcharges: OverchargeItem[] = (data ?? []).map((item) => ({
    id: item.id,
    description: item.description,
    charged: item.charged_amount_cents,
    fair: item.fair_amount_cents ?? item.charged_amount_cents,
    difference: item.charged_amount_cents - (item.fair_amount_cents ?? item.charged_amount_cents),
    reason: item.overcharge_reason,
    explanation: item.overcharge_explanation,
    confidence: item.confidence,
  }));

  return { success: true, data: overcharges };
}

interface FairPriceComparison {
  description: string;
  yourPrice: number;
  fairPrice: number;
  percentAbove: number;
}

export async function fetchFairPriceComparison(billId: string): Promise<ActionResult<FairPriceComparison[]>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('bill_line_items')
    .select('*')
    .eq('bill_id', billId)
    .not('fair_amount_cents', 'is', null)
    .order('charged_amount_cents', { ascending: false });

  if (error) return { success: false, error: error.message };

  const comparisons: FairPriceComparison[] = (data ?? []).map((item) => {
    const fair = item.fair_amount_cents ?? item.charged_amount_cents;
    return {
      description: item.description,
      yourPrice: item.charged_amount_cents,
      fairPrice: fair,
      percentAbove: fair > 0 ? Math.round(((item.charged_amount_cents - fair) / fair) * 100) : 0,
    };
  });

  return { success: true, data: comparisons };
}

interface SavingsOpportunity {
  type: string;
  description: string;
  potentialSavings: number;
  confidence: number;
}

export async function fetchSavingsOpportunities(billId: string): Promise<ActionResult<SavingsOpportunity[]>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('bill_line_items')
    .select('*')
    .eq('bill_id', billId)
    .eq('is_overcharge', true)
    .order('charged_amount_cents', { ascending: false });

  if (error) return { success: false, error: error.message };

  const opportunities: SavingsOpportunity[] = (data ?? []).map((item) => ({
    type: item.overcharge_reason ?? 'overcharge',
    description: item.description,
    potentialSavings: item.charged_amount_cents - (item.fair_amount_cents ?? item.charged_amount_cents),
    confidence: item.confidence ?? 0.5,
  }));

  return { success: true, data: opportunities };
}
