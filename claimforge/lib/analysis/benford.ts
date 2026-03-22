/**
 * Benford's Law Analysis
 *
 * Benford's Law states that in naturally occurring financial data,
 * leading digits follow a specific logarithmic distribution.
 * Significant deviations indicate potential manipulation or fraud.
 */

export interface BenfordResult {
  observed: Record<string, number>;    // observed frequency per digit 1-9
  expected: Record<string, number>;    // expected frequency per Benford
  chiSquare: number;                   // chi-square test statistic
  pValue: number;                      // p-value (< 0.05 = significant deviation)
  deviations: Record<string, number>;  // absolute deviation from expected
  riskScore: number;                   // 0-100 fraud risk score
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  sampleSize: number;
  extractedAmounts: number[];
}

// Benford's expected frequencies for digits 1-9
export const BENFORDS_EXPECTED: Record<string, number> = {
  '1': 30.1, '2': 17.6, '3': 12.5, '4': 9.7,
  '5': 7.9,  '6': 6.7,  '7': 5.8,  '8': 5.1, '9': 4.6,
};

/**
 * Extract all financial amounts from text (dollar amounts, numbers > 10)
 */
export function extractAmounts(text: string): number[] {
  const patterns = [
    /\$[\d,]+(?:\.\d{2})?/g,          // $1,234.56
    /(?:USD|usd)\s*[\d,]+(?:\.\d{2})?/g,
    /\b\d{2,}(?:,\d{3})*(?:\.\d{2})?\b/g, // 12,345.67
  ];

  const amounts: number[] = [];
  for (const pattern of patterns) {
    const matches = text.match(pattern) ?? [];
    for (const m of matches) {
      const num = parseFloat(m.replace(/[$,USD\s]/gi, ''));
      if (!isNaN(num) && num >= 10) amounts.push(num);
    }
  }

  // Deduplicate
  return [...new Set(amounts)];
}

/**
 * Get the leading digit (1-9) of a number
 */
function getLeadingDigit(n: number): string {
  const s = Math.abs(n).toString().replace('.', '').replace(/^0+/, '');
  return s[0] ?? '0';
}

/**
 * Run Benford's Law analysis on a set of amounts
 */
export function analyzeBenford(amounts: number[]): BenfordResult {
  const validAmounts = amounts.filter(a => a > 0 && isFinite(a));
  const n = validAmounts.length;

  if (n < 30) {
    // Not enough data for reliable Benford analysis
    return {
      observed: {},
      expected: BENFORDS_EXPECTED,
      chiSquare: 0,
      pValue: 1,
      deviations: {},
      riskScore: 0,
      riskLevel: 'low',
      sampleSize: n,
      extractedAmounts: validAmounts,
    };
  }

  // Count observed leading digits
  const counts: Record<string, number> = { '1':0,'2':0,'3':0,'4':0,'5':0,'6':0,'7':0,'8':0,'9':0 };
  for (const a of validAmounts) {
    const d = getLeadingDigit(a);
    if (d in counts) counts[d]++;
  }

  // Calculate observed percentages
  const observed: Record<string, number> = {};
  for (const d of Object.keys(counts)) {
    observed[d] = parseFloat(((counts[d] / n) * 100).toFixed(2));
  }

  // Calculate chi-square statistic: Σ (O-E)² / E
  let chiSquare = 0;
  const deviations: Record<string, number> = {};
  for (const d of Object.keys(BENFORDS_EXPECTED)) {
    const expected = (BENFORDS_EXPECTED[d] / 100) * n;
    const actual = counts[d];
    chiSquare += Math.pow(actual - expected, 2) / expected;
    deviations[d] = parseFloat(Math.abs((observed[d] ?? 0) - BENFORDS_EXPECTED[d]).toFixed(2));
  }

  // Approximate p-value for chi-square with 8 degrees of freedom
  // Critical values: 0.05 → 15.507, 0.01 → 20.090, 0.001 → 26.124
  let pValue = 1;
  if (chiSquare > 26.124) pValue = 0.001;
  else if (chiSquare > 20.090) pValue = 0.01;
  else if (chiSquare > 15.507) pValue = 0.05;
  else if (chiSquare > 13.362) pValue = 0.1;

  // Calculate risk score (0-100)
  const maxDev = Math.max(...Object.values(deviations));
  let riskScore = Math.min(100, Math.round((chiSquare / 30) * 100));

  let riskLevel: BenfordResult['riskLevel'] = 'low';
  if (riskScore >= 75 || pValue <= 0.001) riskLevel = 'critical';
  else if (riskScore >= 50 || pValue <= 0.01) riskLevel = 'high';
  else if (riskScore >= 25 || pValue <= 0.05) riskLevel = 'medium';

  return {
    observed,
    expected: BENFORDS_EXPECTED,
    chiSquare: parseFloat(chiSquare.toFixed(3)),
    pValue,
    deviations,
    riskScore,
    riskLevel,
    sampleSize: n,
    extractedAmounts: validAmounts,
  };
}
