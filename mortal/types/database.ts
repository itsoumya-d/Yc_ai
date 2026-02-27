// ─── Core Types ──────────────────────────────────────

export type SubscriptionTier = 'free' | 'plus' | 'family';

export type WishCategory =
  | 'funeral'
  | 'burial'
  | 'cremation'
  | 'memorial'
  | 'organ_donation'
  | 'medical_directive'
  | 'care_preferences'
  | 'personal_message'
  | 'other';

export type AssetCategory =
  | 'email'
  | 'social_media'
  | 'financial'
  | 'crypto'
  | 'cloud_storage'
  | 'subscription'
  | 'domain'
  | 'gaming'
  | 'shopping'
  | 'other';

export type DocumentCategory =
  | 'will'
  | 'trust'
  | 'power_of_attorney'
  | 'healthcare_directive'
  | 'insurance'
  | 'deed'
  | 'financial'
  | 'medical'
  | 'identification'
  | 'tax'
  | 'other';

export type ContactRole =
  | 'executor'
  | 'power_of_attorney'
  | 'healthcare_proxy'
  | 'beneficiary'
  | 'guardian'
  | 'digital_executor'
  | 'emergency_contact'
  | 'other';

export type AccessLevel =
  | 'full'
  | 'documents_only'
  | 'wishes_only'
  | 'assets_only'
  | 'emergency_only'
  | 'custom';

export type CheckInFrequency =
  | 'daily'
  | 'weekly'
  | 'biweekly'
  | 'monthly'
  | 'quarterly';

export type EscalationAction =
  | 'notify_contact'
  | 'send_reminder'
  | 'grant_access'
  | 'release_documents';

export type CheckInStatus =
  | 'pending'
  | 'confirmed'
  | 'missed'
  | 'escalated';

export type LegalTemplateCategory =
  | 'will'
  | 'living_will'
  | 'power_of_attorney'
  | 'healthcare_proxy'
  | 'trust'
  | 'beneficiary_designation'
  | 'digital_asset_directive'
  | 'letter_of_instruction';

export type ConversationType =
  | 'wishes_guidance'
  | 'legal_help'
  | 'general_planning'
  | 'document_review';

// ─── Interfaces ──────────────────────────────────────

export interface Profile {
  id: string;
  full_name: string | null;
  date_of_birth: string | null;
  phone: string | null;
  address_city: string | null;
  address_state: string | null;
  address_zip: string | null;
  subscription_tier: SubscriptionTier;
  subscription_expires_at: string | null;
  onboarding_completed: boolean;
  onboarding_completed_at: string | null;
  plan_completeness_percent: number;
  last_check_in_at: string | null;
  notification_email: boolean;
  notification_sms: boolean;
  created_at: string;
  updated_at: string;
}

export interface Wish {
  id: string;
  user_id: string;
  category: WishCategory;
  title: string;
  content: string;
  is_ai_generated: boolean;
  is_finalized: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface DigitalAsset {
  id: string;
  user_id: string;
  category: AssetCategory;
  service_name: string;
  username: string | null;
  url: string | null;
  notes: string | null;
  action_on_death: string | null;
  estimated_value_cents: number | null;
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: string;
  user_id: string;
  category: DocumentCategory;
  title: string;
  description: string | null;
  storage_path: string;
  file_size_bytes: number | null;
  mime_type: string | null;
  is_encrypted: boolean;
  expires_at: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface TrustedContact {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  relationship: string;
  role: ContactRole;
  access_level: AccessLevel;
  is_verified: boolean;
  verified_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface AccessGrant {
  id: string;
  user_id: string;
  contact_id: string;
  resource_type: string;
  resource_id: string | null;
  granted_at: string;
  expires_at: string | null;
  is_active: boolean;
}

export interface CheckInConfig {
  id: string;
  user_id: string;
  frequency: CheckInFrequency;
  preferred_time: string;
  preferred_channel: string;
  grace_period_hours: number;
  max_missed_before_escalation: number;
  is_active: boolean;
  next_check_in_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CheckIn {
  id: string;
  user_id: string;
  config_id: string;
  scheduled_at: string;
  responded_at: string | null;
  status: CheckInStatus;
  response_method: string | null;
  created_at: string;
}

export interface EscalationEvent {
  id: string;
  user_id: string;
  check_in_id: string | null;
  action: EscalationAction;
  contact_id: string | null;
  message: string | null;
  executed_at: string;
  created_at: string;
}

export interface LegalTemplate {
  id: string;
  category: LegalTemplateCategory;
  title: string;
  description: string;
  template_content: string;
  required_fields: string[];
  state_specific: boolean;
  state_codes: string[] | null;
  is_active: boolean;
  created_at: string;
}

export interface UserLegalDocument {
  id: string;
  user_id: string;
  template_id: string | null;
  category: LegalTemplateCategory;
  title: string;
  content: string;
  field_values: Record<string, unknown>;
  is_draft: boolean;
  is_signed: boolean;
  signed_at: string | null;
  witness_names: string[];
  storage_path: string | null;
  created_at: string;
  updated_at: string;
  template?: LegalTemplate;
}

export interface Conversation {
  id: string;
  user_id: string;
  conversation_type: ConversationType;
  title: string | null;
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
