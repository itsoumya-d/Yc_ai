import type { BenfordAnalysis, FraudPattern } from '@/types/database';

// Benford's Law expected frequencies for leading digits 1-9
const BENFORD_EXPECTED: Record<number, number> = {
  1: 30.1,
  2: 17.6,
  3: 12.5,
  4: 9.7,
  5: 7.9,
  6: 6.7,
  7: 5.8,
  8: 5.1,
  9: 4.6,
};

const SUSPICION_THRESHOLD = 4.0; // percentage points

/**
 * Performs Benford's Law analysis on a list of monetary amounts.
 * Returns the frequency distribution and deviation from expected frequencies.
 */
export function benfordAnalysis(amounts: number[]): BenfordAnalysis[] {
  const validAmounts = amounts.filter((a) => a > 0);
  if (validAmounts.length === 0) return [];

  const digitCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 };
  let total = 0;

  for (const amount of validAmounts) {
    const digits = String(Math.abs(amount)).replace(/^0\.0*/, '');
    const firstChar = digits[0];
    if (!firstChar) continue;
    const leadingDigit = parseInt(firstChar, 10);
    if (leadingDigit >= 1 && leadingDigit <= 9) {
      digitCounts[leadingDigit] = (digitCounts[leadingDigit] ?? 0) + 1;
      total++;
    }
  }

  return Object.entries(BENFORD_EXPECTED).map(([digit, expectedFreq]) => {
    const d = parseInt(digit, 10);
    const actualFreq = total > 0 ? ((digitCounts[d] ?? 0) / total) * 100 : 0;
    const deviation = actualFreq - expectedFreq;
    return {
      digit: d,
      expected_frequency: expectedFreq,
      actual_frequency: Math.round(actualFreq * 10) / 10,
      deviation: Math.round(deviation * 10) / 10,
      suspicious: Math.abs(deviation) > SUSPICION_THRESHOLD,
    };
  });
}

/**
 * Computes an overall fraud risk score (0–100) based on detected patterns.
 * Weighted by confidence_level: critical=40, high=25, medium=15, low=5.
 */
export function computeFraudScore(patterns: FraudPattern[]): number {
  if (patterns.length === 0) return 0;

  const weights: Record<string, number> = {
    critical: 40,
    high: 25,
    medium: 15,
    low: 5,
  };

  const rawScore = patterns.reduce((sum, p) => {
    const weight = weights[p.confidence_level] ?? 5;
    return sum + weight * p.confidence;
  }, 0);

  return Math.min(100, Math.round(rawScore));
}

/**
 * Rule-based round-number anomaly detection.
 * Flags amounts that are exact multiples of $100 or just below a round threshold (e.g., $999).
 */
export function detectRoundNumberAnomaly(amounts: number[]): {
  roundCount: number;
  nearThresholdCount: number;
  total: number;
  roundPercentage: number;
} {
  let roundCount = 0;
  let nearThresholdCount = 0;
  const total = amounts.length;

  for (const amount of amounts) {
    const rounded = Math.round(amount);
    if (rounded >= 100 && rounded % 100 === 0) roundCount++;
    const mod1000 = rounded % 1000;
    if (mod1000 >= 990 && mod1000 < 1000) nearThresholdCount++;
  }

  return {
    roundCount,
    nearThresholdCount,
    total,
    roundPercentage: total > 0 ? (roundCount / total) * 100 : 0,
  };
}
