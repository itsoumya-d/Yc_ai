export interface HouseholdProfile {
  income: number;
  familySize: number;
  state: string;
  hasChildren: boolean;
  childrenUnder5: number;
  childrenUnder18: number;
  isPregnant: boolean;
  isDisabled: boolean;
  isVeteran: boolean;
  citizenshipStatus: 'citizen' | 'permanent_resident' | 'other';
  age: number;
  isStudent: boolean;
  hasElderly: boolean;
  elderlyCount: number;
}

export interface BenefitProgram {
  id: string;
  name: string;
  fullName: string;
  category: 'food' | 'healthcare' | 'housing' | 'childcare' | 'education' | 'disability' | 'veterans' | 'tax';
  description: string;
  estimatedAnnualValue: number;
  applicationUrl: string;
  requirements: string[];
}

export interface EligibilityResult {
  program: BenefitProgram;
  status: 'likely' | 'possible' | 'unlikely';
  reason: string;
  estimatedValue: number;
}

function getFPL(familySize: number): number {
  const base = 15060;
  const perPerson = 5380;
  return base + (familySize - 1) * perPerson;
}

const PROGRAMS: BenefitProgram[] = [
  { id: 'snap', name: 'SNAP', fullName: 'Supplemental Nutrition Assistance Program', category: 'food', description: 'Monthly food benefits loaded onto an EBT card for grocery purchases.', estimatedAnnualValue: 3600, applicationUrl: 'https://www.benefits.gov/benefit/361', requirements: ['Income <= 130% FPL', 'US citizenship or qualified alien status'] },
  { id: 'medicaid', name: 'Medicaid', fullName: 'Medicaid Health Insurance', category: 'healthcare', description: 'Free or low-cost health coverage for eligible adults and children.', estimatedAnnualValue: 9000, applicationUrl: 'https://www.healthcare.gov/medicaid-chip/', requirements: ['Income <= 138% FPL (expansion states)', 'Citizen or qualifying immigrant'] },
  { id: 'chip', name: 'CHIP', fullName: "Children's Health Insurance Program", category: 'healthcare', description: 'Low-cost health coverage for children in families that earn too much for Medicaid.', estimatedAnnualValue: 5400, applicationUrl: 'https://www.insurekidsnow.gov/', requirements: ['Children under 19', 'Income between 138%-300% FPL'] },
  { id: 'eitc', name: 'EITC', fullName: 'Earned Income Tax Credit', category: 'tax', description: 'Tax credit for low- to moderate-income workers and families.', estimatedAnnualValue: 3000, applicationUrl: 'https://www.irs.gov/credits-deductions/individuals/earned-income-tax-credit', requirements: ['Earned income from work', 'Income within IRS limits by family size'] },
  { id: 'wic', name: 'WIC', fullName: 'Special Supplemental Nutrition Program for Women, Infants, and Children', category: 'food', description: 'Nutrition assistance for pregnant women, new mothers, and children under 5.', estimatedAnnualValue: 2400, applicationUrl: 'https://www.fns.usda.gov/wic', requirements: ['Pregnant, postpartum, or child under 5', 'Income <= 185% FPL'] },
  { id: 'section8', name: 'Section 8', fullName: 'Housing Choice Voucher Program', category: 'housing', description: 'Rental assistance vouchers to help pay for private housing.', estimatedAnnualValue: 12000, applicationUrl: 'https://www.hud.gov/topics/housing_choice_voucher_program_section_8', requirements: ['Income <= 50% Area Median Income', 'Citizen or eligible immigrant'] },
  { id: 'liheap', name: 'LIHEAP', fullName: 'Low Income Home Energy Assistance Program', category: 'housing', description: 'Help with heating and cooling energy costs.', estimatedAnnualValue: 900, applicationUrl: 'https://liheapch.acf.hhs.gov/', requirements: ['Income <= 150% FPL or 60% state median income'] },
  { id: 'ssi', name: 'SSI', fullName: 'Supplemental Security Income', category: 'disability', description: 'Monthly payments for disabled, blind, or elderly people with limited income.', estimatedAnnualValue: 10680, applicationUrl: 'https://www.ssa.gov/ssi/', requirements: ['Age 65+ OR blind/disabled', 'Income below SSI limits', 'Limited resources'] },
  { id: 'ssdi', name: 'SSDI', fullName: 'Social Security Disability Insurance', category: 'disability', description: 'Monthly benefits for workers with a qualifying disability.', estimatedAnnualValue: 15000, applicationUrl: 'https://www.ssa.gov/disability/', requirements: ['Work history with Social Security taxes paid', 'Medically qualifying disability'] },
  { id: 'ccdf', name: 'CCDF', fullName: 'Child Care and Development Fund', category: 'childcare', description: 'Subsidies to help low-income families afford childcare.', estimatedAnnualValue: 8400, applicationUrl: 'https://childcare.gov/', requirements: ['Child under 13', 'Working or in school', 'Income <= 85% state median income'] },
  { id: 'head_start', name: 'Head Start', fullName: 'Head Start & Early Head Start', category: 'childcare', description: 'Free early childhood education, health, and family support services.', estimatedAnnualValue: 11000, applicationUrl: 'https://www.acf.hhs.gov/ohs', requirements: ['Child ages 0-5', 'Income <= 100% FPL OR in foster care/homeless'] },
  { id: 'pell', name: 'Pell Grant', fullName: 'Federal Pell Grant', category: 'education', description: "Federal grant for college students who haven't earned a bachelor's degree.", estimatedAnnualValue: 7395, applicationUrl: 'https://studentaid.gov/understand-aid/types/grants/pell', requirements: ['Enrolled in eligible college', 'Income-based financial need via FAFSA'] },
  { id: 'va_healthcare', name: 'VA Healthcare', fullName: 'Veterans Affairs Health Care', category: 'veterans', description: 'Comprehensive healthcare services for eligible veterans.', estimatedAnnualValue: 9600, applicationUrl: 'https://www.va.gov/health-care/', requirements: ['Honorably discharged veteran', 'Served minimum active duty period'] },
  { id: 'va_disability', name: 'VA Disability', fullName: 'Veterans Disability Compensation', category: 'veterans', description: 'Monthly payments for veterans with service-connected disabilities.', estimatedAnnualValue: 16800, applicationUrl: 'https://www.va.gov/disability/', requirements: ['Veteran with service-connected disability', 'Disability rating >= 10%'] },
  { id: 'medicare_savings', name: 'MSP', fullName: 'Medicare Savings Programs', category: 'healthcare', description: 'Help pay Medicare premiums, deductibles, and copayments.', estimatedAnnualValue: 2400, applicationUrl: 'https://www.medicare.gov/medicare-savings-programs', requirements: ['Enrolled in Medicare', 'Income <= 200% FPL'] },
];

export function checkEligibility(profile: HouseholdProfile): EligibilityResult[] {
  const fpl = getFPL(profile.familySize);
  const incomeRatio = profile.income / fpl;
  const results: EligibilityResult[] = [];
  for (const program of PROGRAMS) {
    let status: EligibilityResult['status'] = 'unlikely';
    let reason = '';
    let estimatedValue = program.estimatedAnnualValue;
    switch (program.id) {
      case 'snap':
        if (profile.citizenshipStatus \!== 'citizen' && profile.citizenshipStatus \!== 'permanent_resident') {
          status = 'unlikely'; reason = 'Requires citizenship or qualified immigrant status';
        } else if (incomeRatio <= 1.30) {
          status = 'likely'; reason = 'Your income (' + Math.round(incomeRatio * 100) + '% FPL) is within the 130% FPL limit';
          estimatedValue = Math.max(1200, program.estimatedAnnualValue - Math.round(incomeRatio * 1000));
        } else if (incomeRatio <= 1.60) {
          status = 'possible'; reason = 'Income may qualify with deductions (shelter, dependent care)';
          estimatedValue = Math.round(program.estimatedAnnualValue * 0.5);
        } else { status = 'unlikely'; reason = 'Income (' + Math.round(incomeRatio * 100) + '% FPL) exceeds the 130% FPL limit'; }
        break;
      case 'medicaid':
        if (incomeRatio <= 1.38) { status = 'likely'; reason = 'Income qualifies for Medicaid expansion coverage'; }
        else if (profile.hasChildren && incomeRatio <= 2.0) { status = 'possible'; reason = 'Children may qualify under CHIP income thresholds'; }
        else if (profile.isDisabled || (profile.hasElderly && profile.elderlyCount > 0)) { status = 'possible'; reason = 'Disability or age may qualify for Medicaid regardless of income'; }
        else { status = 'unlikely'; reason = 'Income (' + Math.round(incomeRatio * 100) + '% FPL) exceeds 138% FPL threshold'; }
        break;
      case 'chip':
        if (\!profile.hasChildren || profile.childrenUnder18 === 0) { status = 'unlikely'; reason = 'No children under 19 in household'; }
        else if (incomeRatio >= 1.38 && incomeRatio <= 3.0) { status = 'likely'; reason = 'Children likely qualify - income ' + Math.round(incomeRatio * 100) + '% FPL is in CHIP range'; }
        else if (incomeRatio < 1.38) { status = 'possible'; reason = 'Children may qualify for Medicaid (below CHIP floor)'; }
        else { status = 'unlikely'; reason = 'Income above typical CHIP limits'; }
        break;
      case 'eitc':
        if (profile.income < 1000) { status = 'unlikely'; reason = 'Must have earned income from work'; }
        else if (profile.hasChildren && incomeRatio <= 2.5) {
          status = 'likely'; reason = 'Working family with children typically qualifies for EITC';
          estimatedValue = profile.childrenUnder18 >= 3 ? 7400 : profile.childrenUnder18 === 2 ? 6600 : 4200;
        } else if (\!profile.hasChildren && profile.income <= 22000) { status = 'possible'; reason = 'Lower-income workers without children may qualify for smaller EITC'; estimatedValue = 600; }
        else { status = 'unlikely'; reason = 'Income or filing status likely exceeds EITC limits'; }
        break;
      case 'wic':
        if (\!profile.isPregnant && profile.childrenUnder5 === 0) { status = 'unlikely'; reason = 'WIC is for pregnant women and children under 5'; }
        else if (incomeRatio <= 1.85) { status = 'likely'; reason = 'Income and family composition qualify for WIC benefits'; }
        else { status = 'possible'; reason = 'Some states have higher income thresholds for WIC'; }
        break;
      case 'section8':
        status = 'possible'; reason = 'Section 8 has long waitlists - apply immediately; priority given to lowest incomes';
        if (incomeRatio > 0.8) { status = 'unlikely'; reason = 'Income likely above 50% Area Median Income limit'; }
        break;
      case 'liheap':
        if (incomeRatio <= 1.50) { status = 'likely'; reason = 'Income qualifies for home energy assistance'; }
        else { status = 'possible'; reason = 'Eligibility varies by state - check your state program'; }
        break;
      case 'ssi':
        if (profile.isDisabled || profile.age >= 65 || profile.hasElderly) {
          status = 'possible'; reason = 'Disability or age may qualify - subject to income and resource limits';
          if (profile.income <= 12000) { status = 'likely'; reason = 'Low income and qualifying condition suggest SSI eligibility'; }
        } else { status = 'unlikely'; reason = 'Must be age 65+, blind, or have a qualifying disability'; }
        break;
      case 'ssdi':
        if (profile.isDisabled) { status = 'possible'; reason = 'Qualifying disability - contact SSA to review work history requirements'; }
        else { status = 'unlikely'; reason = 'Must have a medically qualifying disability and sufficient work history'; }
        break;
      case 'ccdf':
        if (\!profile.hasChildren || profile.childrenUnder18 === 0) { status = 'unlikely'; reason = 'No eligible children in household'; }
        else if (profile.income <= 40000) { status = 'likely'; reason = 'Working family with children likely qualifies for childcare subsidy'; }
        else { status = 'possible'; reason = 'Eligibility and subsidy amount vary by state and family income'; }
        break;
      case 'head_start':
        if (profile.childrenUnder5 === 0) { status = 'unlikely'; reason = 'Head Start serves children ages 0-5'; }
        else if (incomeRatio <= 1.0) { status = 'likely'; reason = 'Income qualifies for Head Start early education program'; }
        else { status = 'possible'; reason = 'Programs may have slots for over-income families - contact local provider'; }
        break;
      case 'pell':
        if (\!profile.isStudent) { status = 'unlikely'; reason = 'Must be enrolled in an eligible higher education program'; }
        else if (incomeRatio <= 2.5) { status = 'likely'; reason = 'Income and enrollment likely qualify for Pell Grant'; estimatedValue = Math.max(650, Math.round(7395 * (1 - incomeRatio / 3))); }
        else { status = 'possible'; reason = 'File FAFSA - grant amount determined by Expected Family Contribution'; }
        break;
      case 'va_healthcare':
        if (\!profile.isVeteran) { status = 'unlikely'; reason = 'Must be an honorably discharged veteran'; }
        else { status = 'likely'; reason = 'Veterans typically qualify for VA healthcare regardless of income'; }
        break;
      case 'va_disability':
        if (\!profile.isVeteran) { status = 'unlikely'; reason = 'Must be a veteran with a service-connected disability'; }
        else if (profile.isDisabled) { status = 'possible'; reason = 'Veteran with disability - file a VA disability claim to determine rating'; }
        else { status = 'possible'; reason = 'Contact VA to assess potential service-connected conditions'; }
        break;
      case 'medicare_savings':
        if (\!profile.hasElderly && profile.age < 65) { status = 'unlikely'; reason = 'Must be enrolled in Medicare (age 65+ or disability)'; }
        else if (incomeRatio <= 2.0) { status = 'likely'; reason = 'Income qualifies for Medicare Savings Program cost reductions'; }
        else { status = 'possible'; reason = 'Check state-specific Medicare Savings Program income limits'; }
        break;
    }
    results.push({ program, status, reason, estimatedValue });
  }
  return results.sort((a, b) => {
    const order = { likely: 0, possible: 1, unlikely: 2 };
    return order[a.status] - order[b.status];
  });
}

export function getTotalEstimatedValue(results: EligibilityResult[]): number {
  return results
    .filter(r => r.status === 'likely' || r.status === 'possible')
    .reduce((sum, r) => sum + (r.status === 'likely' ? r.estimatedValue : Math.round(r.estimatedValue * 0.5)), 0);
}
