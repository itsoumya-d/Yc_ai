export type DamageType = 'water' | 'fire' | 'wind' | 'structural' | 'vandalism' | 'electrical' | 'other';
export type Severity = 'minor' | 'moderate' | 'severe' | 'total_loss';
export type Urgency = 'immediate' | 'can_wait' | 'cosmetic';
export type InspectionStatus = 'draft' | 'in_progress' | 'completed' | 'submitted';
export type ReportStatus = 'draft' | 'submitted' | 'approved' | 'rejected';
export type PropertyType = 'residential' | 'commercial' | 'industrial' | 'vehicle' | 'other';

export interface DamageItem {
  id: string;
  damage_type: DamageType;
  severity: Severity;
  urgency: Urgency;
  component: string;
  description: string;
  estimated_cost_min: number;
  estimated_cost_max: number;
  photo_url?: string;
  created_at: string;
}

export interface AIAnalysisResult {
  damage_type: DamageType;
  severity: Severity;
  urgency: Urgency;
  affected_components: string[];
  description: string;
  estimated_cost_min: number;
  estimated_cost_max: number;
  confidence: number;
  recommendations: string[];
}

export interface InspectionPhoto {
  id: string;
  uri: string;
  uploaded_url?: string;
  analysis?: AIAnalysisResult;
  analyzed_at?: string;
}

export interface Property {
  id: string;
  name: string;
  address: string;
  type: PropertyType;
  owner_name?: string;
  owner_email?: string;
  owner_phone?: string;
  insurance_policy?: string;
}

export interface Inspection {
  id: string;
  user_id: string;
  property: Property;
  status: InspectionStatus;
  photos: InspectionPhoto[];
  damage_items: DamageItem[];
  total_estimate_min: number;
  total_estimate_max: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

export interface Report {
  id: string;
  inspection_id: string;
  inspection?: Inspection;
  status: ReportStatus;
  title: string;
  summary: string;
  total_claim_amount: number;
  generated_at: string;
  submitted_at?: string;
  approved_at?: string;
  pdf_url?: string;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  company?: string;
  license_number?: string;
  phone?: string;
  avatar_url?: string;
  created_at: string;
}

export interface DashboardStats {
  total_inspections: number;
  total_claims_value: number;
  avg_damage_cost: number;
  properties_inspected: number;
  pending_reports: number;
  approved_reports: number;
}

export interface NotificationSettings {
  push_enabled: boolean;
  email_enabled: boolean;
  report_status_updates: boolean;
  new_assignments: boolean;
  weekly_summary: boolean;
}

export interface AppSettings {
  user: User | null;
  notifications: NotificationSettings;
  openai_api_key?: string;
  insurance_api_key?: string;
  supabase_url?: string;
  supabase_anon_key?: string;
}
