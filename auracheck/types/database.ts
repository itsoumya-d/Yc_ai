export type SeverityLevel = 'stable' | 'monitor' | 'see_dermatologist';
export type BodyArea = 'face' | 'neck' | 'chest' | 'back' | 'left_arm' | 'right_arm' | 'left_leg' | 'right_leg' | 'hands' | 'feet' | 'scalp' | 'other';
export type FitzpatrickType = 1 | 2 | 3 | 4 | 5 | 6;
export type ChangeStatus = 'stable' | 'minor_change' | 'significant_change' | 'urgent';

export interface SkinCheck {
  id: string;
  user_id: string;
  body_area: BodyArea;
  image_uri: string;
  analysis: SkinAnalysis | null;
  created_at: string;
  notes?: string;
}

export interface SkinAnalysis {
  overall_severity: SeverityLevel;
  conditions: SkinCondition[];
  positive_observations: string[];
  summary: string;
  recommendation: string;
  analyzed_at: string;
}

export interface SkinCondition {
  id: string;
  name: string;
  description: string;
  severity: SeverityLevel;
  body_area_location: string;
  abcde?: {
    asymmetry?: string;
    border?: string;
    color?: string;
    diameter?: string;
    evolution?: string;
  };
}

export interface ChangeDetection {
  check_id: string;
  previous_check_id: string;
  change_status: ChangeStatus;
  changes_observed: string[];
  ai_assessment: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  fitzpatrick_type: FitzpatrickType;
  skin_goals: string[];
  checks_count: number;
  streak_days: number;
  tier: 'free' | 'premium';
  created_at: string;
}

export interface HealthCorrelation {
  id: string;
  user_id: string;
  date: string;
  sleep_hours?: number;
  stress_level?: number;
  water_glasses?: number;
  exercise_minutes?: number;
  diet_notes?: string;
  skin_rating?: number;
}
