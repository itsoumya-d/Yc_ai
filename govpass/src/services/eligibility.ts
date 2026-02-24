export interface Program {
  id: string;
  code: string;
  name: string;
  nameEs: string;
  category: 'food' | 'healthcare' | 'housing' | 'cash' | 'tax_credit' | 'childcare';
  description: string;
  descriptionEs: string;
  estimatedAnnualMin: number;
  estimatedAnnualMax: number;
  applicationUrl: string;
}

export interface EligibilityInput {
  householdSize: number;
  annualIncome: number;
  hasChildren: boolean;
  numberOfChildren: number;
  state: string;
  employmentStatus: string;
  age: number;
}

export interface EligibilityResult {
  program: Program;
  isEligible: boolean;
  confidence: number;
  estimatedAnnualValue: number;
  reason?: string;
}

// Federal Poverty Level 2024
const FPL_BASE = 15060;
const FPL_PER_PERSON = 5380;

function getFPL(householdSize: number): number {
  return FPL_BASE + FPL_PER_PERSON * (householdSize - 1);
}

export function calculateEligibility(
  input: EligibilityInput,
  programs: Program[]
): EligibilityResult[] {
  const fpl = getFPL(input.householdSize);
  const results: EligibilityResult[] = [];

  for (const program of programs) {
    let isEligible = false;
    let confidence = 0.7;
    let estimatedValue = Math.round((program.estimatedAnnualMin + program.estimatedAnnualMax) / 2);
    let reason: string | undefined;

    switch (program.code) {
      case 'SNAP': {
        // 130% FPL
        const threshold = fpl * 1.3;
        isEligible = input.annualIncome <= threshold;
        confidence = input.annualIncome <= fpl ? 0.95 : input.annualIncome <= threshold ? 0.8 : 0.1;
        if (!isEligible) reason = `Income above SNAP threshold ($${Math.round(threshold / 12)}/month)`;
        estimatedValue = Math.min(
          program.estimatedAnnualMax,
          Math.max(program.estimatedAnnualMin, 291 * 12 * input.householdSize * 0.4)
        );
        break;
      }
      case 'MEDICAID': {
        // 138% FPL in expansion states
        isEligible = input.annualIncome <= fpl * 1.38;
        confidence = isEligible ? 0.85 : 0.1;
        if (!isEligible) reason = 'Income above Medicaid threshold for your state';
        break;
      }
      case 'EITC': {
        isEligible =
          input.annualIncome > 0 &&
          input.annualIncome <= (input.hasChildren ? 57000 : 18600) &&
          input.age >= 25 &&
          input.age <= 65;
        confidence = isEligible ? 0.9 : 0.1;
        if (input.hasChildren && isEligible) {
          estimatedValue = input.numberOfChildren >= 3 ? 7830 : input.numberOfChildren === 2 ? 6960 : 4213;
        } else {
          estimatedValue = 632;
        }
        break;
      }
      case 'WIC': {
        isEligible =
          input.annualIncome <= fpl * 1.85 &&
          input.hasChildren &&
          input.numberOfChildren > 0;
        confidence = isEligible ? 0.85 : 0.1;
        break;
      }
      case 'CHIP': {
        isEligible = input.hasChildren && input.annualIncome <= fpl * 2.0;
        confidence = isEligible ? 0.8 : 0.1;
        break;
      }
      default:
        isEligible = input.annualIncome <= fpl * 1.5;
        confidence = 0.6;
    }

    results.push({ program, isEligible, confidence, estimatedAnnualValue: estimatedValue, reason });
  }

  return results.sort((a, b) => {
    if (a.isEligible !== b.isEligible) return a.isEligible ? -1 : 1;
    return b.estimatedAnnualValue - a.estimatedAnnualValue;
  });
}
