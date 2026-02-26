export type User = {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  skills: string[];
  phone: string | null;
  created_at: string;
  updated_at: string;
};

export type Neighborhood = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  member_count: number;
  is_public: boolean;
  governance_model: 'direct_democracy' | 'representative' | 'consensus';
  dues_amount: number | null;
  dues_frequency: 'monthly' | 'quarterly' | 'annually' | null;
  created_at: string;
  updated_at: string;
};

export type NeighborhoodMember = {
  id: string;
  neighborhood_id: string;
  user_id: string;
  role: 'admin' | 'moderator' | 'treasurer' | 'member';
  status: 'active' | 'pending' | 'suspended';
  joined_at: string;
  user?: User;
};

export type Post = {
  id: string;
  neighborhood_id: string;
  author_id: string;
  title: string;
  content: string;
  category: 'general' | 'event' | 'alert' | 'question' | 'recommendation' | 'lost_found' | 'marketplace' | 'safety';
  is_pinned: boolean;
  reaction_count: number;
  comment_count: number;
  created_at: string;
  updated_at: string;
  author?: User;
};

export type PostReaction = {
  id: string;
  post_id: string;
  user_id: string;
  type: 'like' | 'helpful' | 'thanks';
};

export type Event = {
  id: string;
  neighborhood_id: string;
  organizer_id: string;
  title: string;
  description: string;
  location: string | null;
  start_date: string;
  end_date: string | null;
  max_attendees: number | null;
  rsvp_count: number;
  category: 'social' | 'meeting' | 'cleanup' | 'fundraiser' | 'workshop' | 'other';
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  created_at: string;
  organizer?: User;
};

export type EventRsvp = {
  id: string;
  event_id: string;
  user_id: string;
  status: 'going' | 'maybe' | 'not_going';
  user?: User;
};

export type GroupOrder = {
  id: string;
  neighborhood_id: string;
  organizer_id: string;
  title: string;
  description: string | null;
  vendor: string;
  deadline: string;
  delivery_date: string | null;
  min_order_amount: number | null;
  current_total: number;
  status: 'open' | 'closed' | 'ordered' | 'delivered' | 'cancelled';
  participant_count: number;
  created_at: string;
  organizer?: User;
};

export type OrderItem = {
  id: string;
  group_order_id: string;
  user_id: string;
  item_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  paid: boolean;
  user?: User;
};

export type Resource = {
  id: string;
  neighborhood_id: string;
  owner_id: string;
  name: string;
  description: string | null;
  category: 'tool' | 'equipment' | 'vehicle' | 'space' | 'other';
  condition: 'new' | 'good' | 'fair' | 'needs_repair';
  deposit_amount: number | null;
  is_available: boolean;
  image_url: string | null;
  created_at: string;
  owner?: User;
};

export type ResourceBooking = {
  id: string;
  resource_id: string;
  user_id: string;
  start_date: string;
  end_date: string;
  status: 'pending' | 'approved' | 'returned' | 'overdue' | 'cancelled';
  notes: string | null;
  resource?: Resource;
  user?: User;
};

export type Vote = {
  id: string;
  neighborhood_id: string;
  author_id: string;
  title: string;
  description: string;
  voting_method: 'simple_majority' | 'ranked_choice' | 'approval';
  start_date: string;
  end_date: string;
  quorum_required: number;
  total_votes: number;
  status: 'draft' | 'active' | 'closed' | 'cancelled';
  created_at: string;
  author?: User;
};

export type VoteOption = {
  id: string;
  vote_id: string;
  label: string;
  description: string | null;
  vote_count: number;
};

export type VoteResponse = {
  id: string;
  vote_id: string;
  user_id: string;
  option_id: string;
  rank: number | null;
};

export type TreasuryEntry = {
  id: string;
  neighborhood_id: string;
  created_by: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  category: string;
  date: string;
  receipt_url: string | null;
  created_at: string;
};

export type ServiceProvider = {
  id: string;
  neighborhood_id: string;
  name: string;
  category: string;
  phone: string | null;
  email: string | null;
  website: string | null;
  rating: number | null;
  review_count: number;
};

export type DashboardStats = {
  memberCount: number;
  activeVotes: number;
  upcomingEvents: number;
  openOrders: number;
  treasuryBalance: number;
  sharedResources: number;
};
