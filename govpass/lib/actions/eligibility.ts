import type { UserProfile, EligibilityResult } from '../../types';

// 2024 Federal Poverty Level thresholds
const FPL_BASE = 15060;
const FPL_PER_PERSON = 5380;

function getFPL(householdSize: number): number {
  return FPL_BASE + (householdSize - 1) * FPL_PER_PERSON;
}

function checkSNAP(profile: UserProfile): EligibilityResult {
  const fpl = getFPL(profile.household_size);
  const grossIncomeLimit = fpl * 1.3;
  const eligible =
    profile.annual_income <= grossIncomeLimit &&
    profile.citizenship_status !== 'other';

  const maxBenefits: Record<number, number> = {
    1: 291, 2: 535, 3: 766, 4: 973, 5: 1155, 6: 1386, 7: 1532, 8: 1751,
  };
  const size = Math.min(profile.household_size, 8);
  const maxMonthly = maxBenefits[size] ?? 1751;
  const netIncome = profile.annual_income / 12;
  const estimatedMonthly = eligible
    ? Math.max(0, Math.round(maxMonthly - netIncome * 0.3))
    : 0;

  return {
    program: 'snap',
    programName: 'SNAP Food Benefits',
    eligible,
    annualBenefit: estimatedMonthly * 12,
    estimated_amount: estimatedMonthly,
    notes: eligible ? `~$${estimatedMonthly}/month estimated` : undefined,
    reason: eligible
      ? 'You appear eligible for SNAP food assistance.'
      : 'Your income or status may not qualify for SNAP.',
    confidence: 'medium',
    requirements_met: eligible ? ['Income within 130% FPL', 'Citizenship requirement met'] : [],
    requirements_missing: eligible ? [] : ['Income may exceed 130% FPL limit'],
  };
}

function checkMedicaid(profile: UserProfile): EligibilityResult {
  const fpl = getFPL(profile.household_size);
  const incomeLimit = fpl * 1.38;
  const eligible =
    profile.annual_income <= incomeLimit &&
    profile.citizenship_status !== 'other';

  return {
    program: 'medicaid',
    programName: 'Medicaid Health Coverage',
    eligible,
    annualBenefit: eligible ? 6000 : 0,
    notes: eligible ? 'Free or low-cost health coverage' : undefined,
    reason: eligible
      ? 'You likely qualify for Medicaid health coverage.'
      : 'Income or status may not qualify for Medicaid.',
    confidence: 'medium',
    requirements_met: eligible ? ['Income within 138% FPL'] : [],
    requirements_missing: eligible ? [] : ['Income exceeds Medicaid limit'],
  };
}

function checkEITC(profile: UserProfile): EligibilityResult {
  const childCount = Math.min(profile.children_count ?? 0, 3);
  const limits: Record<number, number> = { 0: 18591, 1: 49084, 2: 55768, 3: 59899 };
  const maxCredits: Record<number, number> = { 0: 632, 1: 4213, 2: 6960, 3: 7830 };
  const incomeLimit = limits[childCount] ?? 59899;
  const maxCredit = maxCredits[childCount] ?? 7830;
  const eligible = profile.annual_income <= incomeLimit;
  const estimated = eligible
    ? Math.round(maxCredit * (1 - profile.annual_income / incomeLimit))
    : 0;

  return {
    program: 'eitc',
    programName: 'Earned Income Tax Credit',
    eligible,
    annualBenefit: estimated,
    estimated_amount: estimated,
    notes: eligible ? `Up to $${maxCredit.toLocaleString()} credit` : undefined,
    reason: eligible
      ? 'You appear to qualify for EITC tax credit.'
      : 'Income exceeds EITC limits.',
    confidence: 'high',
    requirements_met: eligible ? ['Income within limits', 'Has earned income'] : [],
    requirements_missing: eligible ? [] : ['Income exceeds EITC limit'],
  };
}

export function calculateEligibility(profile: UserProfile): EligibilityResult[] {
  const results: EligibilityResult[] = [];
  results.push(checkSNAP(profile));
  results.push(checkMedicaid(profile));
  results.push(checkEITC(profile));

  // WIC - for families with young children
  const fpl = getFPL(profile.household_size);
  const wicEligible =
    (profile.has_children || (profile.children_count ?? 0) > 0) &&
    profile.annual_income <= fpl * 1.85;

  results.push({
    program: 'wic',
    programName: 'WIC Nutrition Program',
    eligible: wicEligible,
    annualBenefit: wicEligible ? 600 : 0,
    estimated_amount: wicEligible ? 50 : 0,
    notes: wicEligible ? '~$50/month in food vouchers' : undefined,
    reason: wicEligible
      ? 'You may qualify for WIC nutrition assistance.'
      : 'WIC requires children under 5 or pregnancy.',
    confidence: 'medium',
    requirements_met: wicEligible
      ? ['Has eligible children', 'Income within 185% FPL']
      : [],
    requirements_missing: wicEligible ? [] : ['No children under 5 reported'],
  });

  return results;
}
