// All TypeScript types for Mortal

export interface User {
  id: string;
  email: string;
  full_name?: string;
  created_at: string;
  last_checkin?: string;
  checkin_frequency_days: number;
  biometric_enabled: boolean;
  subscription_tier: 'free' | 'premium';
}

export type WishCategoryType = 'funeral' | 'organ_donation' | 'care_directives' | 'messages' | 'legacy';

export interface WishCategoryItem {
  id: string;
  user_id: string;
  category: WishCategoryType;
  title: string;
  encrypted_data: string;
  completion_pct: number;
  updated_at: string;
}

export interface WishesData {
  id?: string;
  user_id?: string;
  funeral_wishes?: string;
  funeral_completion?: number;
  organ_donation?: string;
  organ_completion?: number;
  care_directives?: string;
  care_completion?: number;
  personal_messages?: string;
  messages_completion?: number;
  updated_at?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
  timestamp?: string;
}

export interface DigitalAsset {
  id: string;
  user_id: string;
  name: string;
  platform?: string;
  username?: string;
  account_name?: string;
  category: string;
  asset_type?: 'social_media' | 'financial' | 'crypto' | 'email' | 'subscription' | 'other';
  disposition: string;
  beneficiary_contact_id?: string;
  notes?: string;
  encrypted_credentials?: string;
  created_at: string;
  updated_at?: string;
}

export interface VaultDocument {
  id: string;
  user_id: string;
  name: string;
  file_name?: string;
  file_size?: number;
  file_type?: string;
  doc_type?: string;
  storage_path: string;
  category?: 'legal' | 'medical' | 'financial' | 'insurance' | 'personal' | 'other';
  ai_summary?: string;
  ai_category?: string;
  encrypted?: boolean;
  created_at: string;
  uploaded_at?: string;
}

export interface TrustedContact {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone?: string;
  relationship?: string;
  role: string;
  access_level?: 'full' | 'limited' | 'emergency_only';
  notify_on_switch?: boolean;
  verified?: boolean;
  notes?: string;
  created_at: string;
}

export interface CheckIn {
  id: string;
  user_id: string;
  checked_in_at: string;
  method: 'biometric' | 'tap' | 'app_open';
}

export interface SwitchAlert {
  id: string;
  user_id: string;
  triggered_at: string;
  contacts_notified: string[];
  status: 'pending' | 'sent' | 'cancelled';
}

export interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  isBiometricUnlocked: boolean;
}
