// GovPass TypeScript Types

export type ApplicationStatus = 'draft' | 'submitted' | 'under_review' | 'approved' | 'denied';

export type BenefitProgram = 'snap' | 'medicaid' | 'eitc' | 'wic' | 'chip' | 'housing' | 'ssi' | 'ssdi';

export type DocumentType = 'id' | 'tax' | 'pay_stub' | 'social_security' | 'bank_statement';

export type ExtractedFields = Record<string, string | number | boolean>;

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  date_of_birth?: string;
  ssn_last4?: string;
  phone?: string;
  state?: string;
  household_size: number;
  annual_income: number;
  employment_status?: 'employed' | 'unemployed' | 'self_employed' | 'disabled' | 'retired';
  citizenship_status: 'citizen' | 'permanent_resident' | 'other';
  has_children: boolean;
  children_count?: number;
  is_veteran: boolean;
  has_disability?: boolean;
  is_disabled?: boolean;
  created_at: string;
  updated_at: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zip: string;
}

export interface Application {
  id: string;
  user_id: string;
  program: string;
  program_name: string;
  status: ApplicationStatus;
  submitted_at?: string;
  updated_at: string;
  created_at: string;
  form_data?: object;
  notes?: string;
  reference_number?: string;
  estimated_benefit?: number;
  estimated_benefit_amount?: number;
  next_step?: string;
}

export interface ExtractedDocumentData {
  name?: string;
  date_of_birth?: string;
  ssn?: string;
  address?: string;
  expiry_date?: string;
  id_number?: string;
  employer?: string;
  income_amount?: number;
  income_period?: 'weekly' | 'biweekly' | 'monthly' | 'annual';
  raw_text?: string;
  confidence?: number;
}

export interface Document {
  id: string;
  user_id: string;
  type: DocumentType;
  file_url: string;
  extracted_data?: ExtractedDocumentData;
  verified: boolean;
  created_at: string;
}

export interface EligibilityResult {
  program: string;
  programName: string;
  eligible: boolean;
  annualBenefit: number;
  estimated_amount?: number;
  notes?: string;
  reason?: string;
  confidence?: 'high' | 'medium' | 'low';
  requirements_met?: string[];
  requirements_missing?: string[];
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  body: string;
  read: boolean;
  created_at: string;
  application_id?: string;
}
