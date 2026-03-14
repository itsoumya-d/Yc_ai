export type PostCategory = 'general' | 'event' | 'alert' | 'question' | 'marketplace' | 'safety' | 'recommendation';
export type VoteType = 'for' | 'against' | 'abstain';

export interface Neighborhood {
  id: string;
  name: string;
  city: string;
  state: string;
  zip_code: string;
  member_count: number;
  created_at: string;
}

export interface NeighborhoodMember {
  id: string;
  neighborhood_id: string;
  user_id: string;
  role: 'admin' | 'moderator' | 'member';
  joined_at: string;
  user_profile?: { full_name: string; avatar_url: string | null; email: string };
}

export interface Post {
  id: string;
  neighborhood_id: string;
  user_id: string;
  category: PostCategory;
  title: string;
  content: string;
  image_url: string | null;
  reactions: { like: number; helpful: number };
  comment_count: number;
  created_at: string;
  user_profile?: { full_name: string; avatar_url: string | null };
}

export interface Event {
  id: string;
  neighborhood_id: string;
  user_id: string;
  title: string;
  description: string;
  location: string;
  starts_at: string;
  ends_at: string | null;
  max_attendees: number | null;
  rsvp_count: number;
  created_at: string;
  user_profile?: { full_name: string };
}

export interface Proposal {
  id: string;
  neighborhood_id: string;
  user_id: string;
  title: string;
  description: string;
  status: 'draft' | 'voting' | 'passed' | 'failed' | 'withdrawn';
  voting_ends_at: string | null;
  votes_for: number;
  votes_against: number;
  votes_abstain: number;
  created_at: string;
  user_profile?: { full_name: string };
}

export interface GroupOrder {
  id: string;
  neighborhood_id: string;
  user_id: string;
  title: string;
  description: string;
  vendor: string;
  total_cost: number;
  deadline: string;
  status: 'open' | 'closed' | 'fulfilled' | 'cancelled';
  participant_count: number;
  created_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  plan: 'free' | 'community' | 'hoa';
  status: 'active' | 'past_due' | 'cancelled' | 'trialing';
  current_period_end: string | null;
  created_at: string;
}
