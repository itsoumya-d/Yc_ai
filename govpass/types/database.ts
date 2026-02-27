// ─── Core Types ──────────────────────────────────────

export type Language = 'en' | 'es';

export type IncomeBracket =
  | '0_15000'
  | '15000_30000'
  | '30000_50000'
  | '50000_75000'
  | '75000_plus';

export type EmploymentStatus =
  | 'employed'
  | 'unemployed'
  | 'self_employed'
  | 'retired'
  | 'disabled'
  | 'student';

export type CitizenshipStatus =
  | 'citizen'
  | 'permanent_resident'
  | 'visa_holder'
  | 'undocumented'
  | 'refugee'
  | 'prefer_not_say';

export type SubscriptionTier = 'free' | 'plus' | 'family';

export type Relationship =
  | 'spouse'
  | 'child'
  | 'parent'
  | 'sibling'
  | 'grandparent'
  | 'grandchild'
  | 'other';

export type AgeBracket =
  | 'under_1'
  | '1_4'
  | '5_12'
  | '13_17'
  | '18_24'
  | '25_54'
  | '55_64'
  | '65_plus';

export type DocumentType =
  | 'drivers_license'
  | 'state_id'
  | 'passport'
  | 'ssn_card'
  | 'w2'
  | 'tax_return'
  | 'pay_stub'
  | 'birth_certificate'
  | 'immigration_doc'
  | 'utility_bill'
  | 'bank_statement'
  | 'lease_agreement'
  | 'other';

export type BenefitCategory =
  | 'food'
  | 'healthcare'
  | 'housing'
  | 'cash'
  | 'tax_credit'
  | 'childcare'
  | 'education'
  | 'disability'
  | 'communication'
  | 'energy'
  | 'immigration'
  | 'other';

export type EligibilityStatus =
  | 'likely_eligible'
  | 'may_be_eligible'
  | 'not_eligible'
  | 'unknown'
  | 'needs_more_info';

export type ApplicationStatus =
  | 'draft'
  | 'in_progress'
  | 'submitted'
  | 'pending'
  | 'approved'
  | 'denied'
  | 'appealing'
  | 'expired'
  | 'withdrawn';

export type NotificationType =
  | 'deadline_reminder'
  | 'renewal_alert'
  | 'missing_document'
  | 'status_check'
  | 'approval'
  | 'denial'
  | 'appeal_deadline'
  | 'document_expiry'
  | 'eligibility_update'
  | 'welcome'
  | 'general';

export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';
export type NotificationChannel = 'push' | 'sms' | 'both';

export type AgencyType =
  | 'federal'
  | 'state'
  | 'county'
  | 'city'
  | 'nonprofit'
  | 'legal_aid'
  | 'community_health'
  | 'library'
  | 'other';

export type SessionType =
  | 'form_guidance'
  | 'eligibility_qa'
  | 'general_help'
  | 'appeal_guidance';

// ─── Interfaces ──────────────────────────────────────

export interface Profile {
  id: string;
  preferred_language: Language;
  household_size: number;
  household_income_bracket: IncomeBracket | null;
  annual_income_cents: number | null;
  employment_status: EmploymentStatus | null;
  citizenship_status: CitizenshipStatus | null;
  has_children_under_18: boolean;
  number_of_dependents: number;
  state_code: string | null;
  county: string | null;
  subscription_tier: SubscriptionTier;
  subscription_expires_at: string | null;
  push_opted_in: boolean;
  sms_opted_in: boolean;
  quiet_hours_start: string;
  quiet_hours_end: string;
  onboarding_completed: boolean;
  onboarding_completed_at: string | null;
  last_eligibility_check_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface HouseholdMember {
  id: string;
  user_id: string;
  relationship: Relationship;
  age_bracket: AgeBracket | null;
  is_dependent: boolean;
  has_disability: boolean;
  is_pregnant: boolean;
  is_veteran: boolean;
  employment_status: EmploymentStatus | null;
  created_at: string;
  updated_at: string;
}

export interface ScannedDocument {
  id: string;
  user_id: string;
  document_type: DocumentType;
  extraction_confidence: number | null;
  field_confidences: Record<string, number>;
  is_in_vault: boolean;
  is_verified_by_user: boolean;
  verification_notes: string | null;
  expires_at: string;
  scanned_at: string;
  updated_at: string;
}

export interface DocumentVaultItem {
  id: string;
  user_id: string;
  scanned_document_id: string | null;
  document_type: DocumentType;
  display_name: string;
  display_name_es: string | null;
  storage_path: string;
  file_size_bytes: number | null;
  document_date: string | null;
  document_expiry_date: string | null;
  is_expired: boolean;
  tags: string[];
  notes: string | null;
  last_used_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface BenefitProgram {
  id: string;
  program_code: string;
  program_name: string;
  program_name_es: string;
  short_description: string;
  short_description_es: string;
  description: string;
  description_es: string;
  agency: string;
  agency_url: string | null;
  agency_phone: string | null;
  category: BenefitCategory;
  eligibility_rules: Record<string, unknown>;
  income_limit_fpl_percent: number | null;
  estimated_annual_value_min: number | null;
  estimated_annual_value_max: number | null;
  application_url: string | null;
  application_url_es: string | null;
  required_documents: string[];
  application_steps: unknown[];
  application_steps_es: unknown[];
  estimated_application_minutes: number;
  renewal_period_months: number | null;
  processing_time_days_min: number | null;
  processing_time_days_max: number | null;
  is_federal: boolean;
  state_codes: string[] | null;
  requires_interview: boolean;
  allows_online_application: boolean;
  is_active: boolean;
  priority_score: number;
  last_verified_at: string;
  created_at: string;
}

export interface EligibilityResult {
  id: string;
  user_id: string;
  program_id: string;
  is_eligible: boolean;
  eligibility_status: EligibilityStatus;
  confidence: number;
  estimated_annual_value: number | null;
  estimated_monthly_value: number | null;
  missing_documents: string[];
  missing_information: string[];
  disqualifying_factors: string[];
  qualifying_factors: string[];
  income_ratio_to_limit: number | null;
  calculated_at: string;
  expires_at: string;
  program?: BenefitProgram;
}

export interface SavedBenefit {
  id: string;
  user_id: string;
  program_id: string;
  notes: string | null;
  saved_at: string;
  program?: BenefitProgram;
}

export interface Application {
  id: string;
  user_id: string;
  program_id: string;
  status: ApplicationStatus;
  current_step: number;
  total_steps: number;
  completed_steps: number[];
  documents_attached: string[];
  submitted_at: string | null;
  agency_confirmation_number: string | null;
  agency_case_number: string | null;
  next_action: string | null;
  next_action_es: string | null;
  next_deadline: string | null;
  approval_date: string | null;
  approval_amount_annual: number | null;
  denial_date: string | null;
  denial_reason: string | null;
  denial_reason_es: string | null;
  appeal_deadline: string | null;
  renewal_date: string | null;
  notes: string | null;
  is_renewal: boolean;
  created_at: string;
  updated_at: string;
  program?: BenefitProgram;
}

export interface NotificationSchedule {
  id: string;
  user_id: string;
  application_id: string | null;
  program_id: string | null;
  notification_type: NotificationType;
  scheduled_for: string;
  channel: NotificationChannel;
  message_en: string;
  message_es: string;
  title_en: string | null;
  title_es: string | null;
  deep_link: string | null;
  priority: NotificationPriority;
  is_sent: boolean;
  is_read: boolean;
  is_dismissed: boolean;
  sent_at: string | null;
  read_at: string | null;
  created_at: string;
}

export interface ReferralAgency {
  id: string;
  agency_name: string;
  agency_name_es: string;
  agency_type: AgencyType;
  description: string | null;
  description_es: string | null;
  programs_served: string[];
  phone: string | null;
  email: string | null;
  website: string | null;
  address_city: string | null;
  address_state: string | null;
  hours_of_operation: Record<string, unknown> | null;
  languages_spoken: string[];
  accepts_walk_ins: boolean;
  is_active: boolean;
  created_at: string;
}

export interface AiGuidanceSession {
  id: string;
  user_id: string;
  application_id: string | null;
  program_id: string | null;
  session_type: SessionType;
  current_step: number | null;
  language: Language;
  messages: unknown[];
  message_count: number;
  is_active: boolean;
  started_at: string;
  last_message_at: string;
  created_at: string;
}

// ─── Action Result ───────────────────────────────────

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };
