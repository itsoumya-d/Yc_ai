export type PostCategory = 'general' | 'event' | 'alert' | 'marketplace' | 'request';
export type OrderStatus = 'open' | 'minimum_met' | 'ordering' | 'delivered' | 'cancelled';
export type BookingStatus = 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled';
export type VoteMethod = 'simple_majority' | 'supermajority' | 'consensus';
export type TreasuryEntryType = 'income' | 'expense' | 'transfer';

export interface Neighborhood {
  id: string;
  name: string;
  slug: string;
  description: string;
  member_count: number;
  admin_id: string;
  created_at: string;
}

export interface NeighborhoodMember {
  id: string;
  neighborhood_id: string;
  user_id: string;
  display_name: string;
  role: 'admin' | 'moderator' | 'member';
  joined_at: string;
}

export interface Post {
  id: string;
  neighborhood_id: string;
  author_id: string;
  author_name: string;
  category: PostCategory;
  title: string;
  body: string;
  ai_summary: string | null;
  is_pinned: boolean;
  likes: number;
  created_at: string;
}

export interface GroupOrder {
  id: string;
  neighborhood_id: string;
  organizer_id: string;
  organizer_name: string;
  title: string;
  description: string;
  vendor_name: string;
  unit_price: number;
  minimum_units: number;
  current_units: number;
  deadline: string;
  status: OrderStatus;
  total_amount: number;
  created_at: string;
}

export interface Resource {
  id: string;
  neighborhood_id: string;
  owner_id: string;
  owner_name: string;
  name: string;
  description: string;
  category: string;
  deposit_amount: number;
  is_available: boolean;
  photo_url: string | null;
  created_at: string;
}

export interface ResourceBooking {
  id: string;
  resource_id: string;
  resource_name: string;
  borrower_id: string;
  borrower_name: string;
  starts_at: string;
  ends_at: string;
  status: BookingStatus;
  notes: string;
  created_at: string;
}

export interface Vote {
  id: string;
  neighborhood_id: string;
  creator_id: string;
  title: string;
  description: string;
  options: Array<{ id: string; text: string; votes: number }>;
  voting_method: VoteMethod;
  quorum_percent: number;
  deadline: string;
  is_closed: boolean;
  total_votes: number;
  created_at: string;
}

export interface TreasuryEntry {
  id: string;
  neighborhood_id: string;
  entry_type: TreasuryEntryType;
  category: string;
  description: string;
  amount: number;
  approved_by: string | null;
  created_by: string;
  created_at: string;
}
