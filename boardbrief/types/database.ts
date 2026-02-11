export type MemberType = 'director' | 'observer' | 'advisor';
export type MeetingType = 'regular' | 'special' | 'committee' | 'annual';
export type MeetingStatus = 'draft' | 'scheduled' | 'completed' | 'canceled';
export type ActionItemStatus = 'open' | 'in_progress' | 'completed' | 'deferred';
export type ActionItemPriority = 'high' | 'medium' | 'low';
export type ResolutionStatus = 'draft' | 'voting' | 'passed' | 'failed';
export type AIGenerationType = 'agenda' | 'summary' | 'resolution';

export interface BoardMember {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  member_type: MemberType;
  title: string | null;
  company: string | null;
  phone: string | null;
  can_vote: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Meeting {
  id: string;
  user_id: string;
  title: string;
  meeting_type: MeetingType;
  status: MeetingStatus;
  scheduled_at: string | null;
  duration_minutes: number;
  location: string | null;
  video_link: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ActionItem {
  id: string;
  user_id: string;
  meeting_id: string | null;
  title: string;
  description: string | null;
  status: ActionItemStatus;
  priority: ActionItemPriority;
  assignee_name: string | null;
  due_date: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Resolution {
  id: string;
  user_id: string;
  meeting_id: string | null;
  title: string;
  body: string | null;
  status: ResolutionStatus;
  votes_for: number;
  votes_against: number;
  votes_abstain: number;
  created_at: string;
  updated_at: string;
}

export interface AIGeneration {
  id: string;
  user_id: string;
  prompt: string;
  result: string;
  generation_type: AIGenerationType;
  tokens_used: number;
  model: string;
  created_at: string;
}

export interface MeetingWithDetails extends Meeting {
  action_items: ActionItem[];
  resolutions: Resolution[];
}
