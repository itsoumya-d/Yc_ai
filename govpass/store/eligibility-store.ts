import { create } from 'zustand';

export interface Profile {
  householdSize: number;
  monthlyIncome: number;
  state: string;
  hasChildren: boolean;
  hasDisability: boolean;
  isVeteran: boolean;
  citizenshipStatus: string;
}

export type EligibilityResult = 'likely' | 'maybe' | 'not_eligible';

export interface ScannedDocument {
  id: string;
  type: string;
  capturedAt: string;
  fields: Record<string, string>;
  status: 'processing' | 'extracted' | 'error';
}

export interface Application {
  id: string;
  programId: string;
  programName: string;
  agency: string;
  status: 'submitted' | 'under_review' | 'info_needed' | 'decision';
  submittedDate: string;
  estimatedWait: string;
  nextAction: string;
  confirmationNumber: string;
}

export interface EligibilityStore {
  profile: Profile;
  updateProfile: (p: Partial<Profile>) => void;
  checkedPrograms: string[];
  results: Record<string, EligibilityResult>;
  runEligibilityCheck: () => void;
  scannedDocuments: ScannedDocument[];
  addScannedDocument: (doc: ScannedDocument) => void;
  updateDocumentStatus: (id: string, status: ScannedDocument['status'], fields?: Record<string, string>) => void;
  applications: Application[];
  addApplication: (app: Application) => void;
  language: 'en' | 'es';
  setLanguage: (lang: 'en' | 'es') => void;
}

function computeResults(profile: Profile): Record<string, EligibilityResult> {
  const { monthlyIncome, householdSize, hasChildren, hasDisability, isVeteran } = profile;
  const annualIncome = monthlyIncome * 12;
  const fpl = 15060 + (householdSize - 1) * 5380;
  return {
    snap: annualIncome <= fpl * 1.3 ? 'likely' : annualIncome <= fpl * 1.8 ? 'maybe' : 'not_eligible',
    medicaid: annualIncome <= fpl * 1.38 ? 'likely' : annualIncome <= fpl * 2.0 ? 'maybe' : 'not_eligible',
    wic: (hasChildren && annualIncome <= fpl * 1.85) ? 'likely' : (hasChildren && annualIncome <= fpl * 2.5) ? 'maybe' : 'not_eligible',
    chip: (hasChildren && annualIncome <= fpl * 2.0) ? 'likely' : (hasChildren && annualIncome <= fpl * 3.0) ? 'maybe' : 'not_eligible',
    eitc: (annualIncome <= 57000 && hasChildren) ? 'likely' : (annualIncome <= 57000) ? 'maybe' : 'not_eligible',
    housing: annualIncome <= fpl * 0.8 ? 'likely' : annualIncome <= fpl * 1.5 ? 'maybe' : 'not_eligible',
    liheap: annualIncome <= fpl * 1.5 ? 'likely' : annualIncome <= fpl * 2.0 ? 'maybe' : 'not_eligible',
    ssi: (hasDisability && annualIncome <= 18000) ? 'likely' : hasDisability ? 'maybe' : 'not_eligible',
    aca: (annualIncome >= fpl * 1.0 && annualIncome <= fpl * 4.0) ? 'likely' : 'maybe',
    veterans: isVeteran ? 'likely' : 'not_eligible',
  };
}

const DEFAULT_PROFILE: Profile = {
  householdSize: 3,
  monthlyIncome: 2800,
  state: 'CA',
  hasChildren: true,
  hasDisability: false,
  isVeteran: false,
  citizenshipStatus: 'citizen',
};
