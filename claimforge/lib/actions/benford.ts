'use server';

import { createClient } from '@/lib/supabase/server';

interface ActionResult<T = null> { data?: T; error?: string; }

export interface BenfordDigitData {
  digit: number;
  expected: number;
  actual: number;
  suspicious: boolean;
  count: number;
}

export interface BenfordResult {
  digitData: BenfordDigitData[];
  totalAmounts: number;
  chiSquare: number;
  fraudIndicator: 'high' | 'medium' | 'low' | 'insufficient_data';
}

// Benford's Law first-digit expected frequencies (%)
const BENFORD: Record<number, number> = {
  1: 30.103,
  2: 17.609,
  3: 12.494,
  4: 9.691,
  5: 7.918,
  6: 6.695,
  7: 5.799,
  8: 5.115,
  9: 4.576,
};

function firstDigit(amount: number): number | null {
  if (!isFinite(amount) || amount <= 0) return null;
  const str = Math.abs(amount).toFixed(0);
  const match = str.match(/[1-9]/);
  return match ? parseInt(match[0], 10) : null;
}

export async function computeBenfordAnalysis(
  caseId?: string,
): Promise<ActionResult<BenfordResult>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  let query = supabase.from('fraud_patterns').select('affected_amount');
  if (caseId) query = query.eq('case_id', caseId);

  const { data: patterns, error } = await query;
  if (error) return { error: error.message };

  const amounts = (patterns ?? [])
    .map(p => p.affected_amount)
    .filter((a): a is number => typeof a === 'number' && a > 0);

  // Insufficient data: return demo-mode result
  if (amounts.length < 10) {
    const digitData = Object.entries(BENFORD).map(([d, exp]) => ({
      digit: parseInt(d),
      expected: exp,
      actual: exp,
      suspicious: false,
      count: 0,
    }));
    return {
      data: {
        digitData,
        totalAmounts: 0,
        chiSquare: 0,
        fraudIndicator: 'insufficient_data',
      },
    };
  }

  // Count first digits
  const counts: Record<number, number> = {};
  for (let d = 1; d <= 9; d++) counts[d] = 0;
  for (const a of amounts) {
    const d = firstDigit(a);
    if (d !== null) counts[d]++;
  }

  const total = Object.values(counts).reduce((s, c) => s + c, 0);
  let chiSquare = 0;
  const digitData: BenfordDigitData[] = [];

  for (let d = 1; d <= 9; d++) {
    const expected = BENFORD[d];
    const actualPct = total > 0 ? (counts[d] / total) * 100 : expected;
    const deviation = Math.abs(actualPct - expected);
    // Flag if deviation > 25% of expected value
    const suspicious = deviation > expected * 0.25;

    // Chi-square contribution
    const expectedCount = (expected / 100) * total;
    chiSquare += Math.pow(counts[d] - expectedCount, 2) / (expectedCount || 1);

    digitData.push({
      digit: d,
      expected,
      actual: parseFloat(actualPct.toFixed(1)),
      suspicious,
      count: counts[d],
    });
  }

  // Chi-square critical values for 8 df: p=0.05 → 15.507, p=0.01 → 20.090
  const chi = parseFloat(chiSquare.toFixed(2));
  const fraudIndicator: BenfordResult['fraudIndicator'] =
    chi > 20.09 ? 'high' :
    chi > 15.507 ? 'medium' :
    'low';

  return {
    data: {
      digitData,
      totalAmounts: total,
      chiSquare: chi,
      fraudIndicator,
    },
  };
}
