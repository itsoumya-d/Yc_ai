export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export type PostCategory = 'general' | 'event' | 'alert' | 'question' | 'recommendation' | 'marketplace' | 'lost_found' | 'safety';
export type OrderStatus = 'open' | 'locked' | 'ordered' | 'delivered' | 'completed' | 'cancelled';
export type VoteMethod = 'simple_majority' | 'ranked_choice' | 'approval';
export type VoteStatus = 'active' | 'passed' | 'failed' | 'no_quorum' | 'cancelled';
export type EventRsvp = 'going' | 'maybe' | 'not_going';
export type MemberRole = 'admin' | 'moderator' | 'treasurer' | 'member';
export type TreasuryCategory = 'dues' | 'donation' | 'fine' | 'event' | 'maintenance' | 'supplies' | 'other';

export interface Profile {
  id: string;
  full_name: string;
  display_name: string;
  bio: string | null;
  avatar_url: string | null;
  skills: string[];
  phone: string | null;
  address: string | null;
  address_verified: boolean;
  show_on_map: boolean;
  show_in_directory: boolean;
  allow_dm: boolean;
  created_at: string;
  updated_at: string;
}

export interface Neighborhood {
  id: string;
  name: string;
  description: string | null;
  city: string;
  state: string;
  zip_code: string;
  member_count: number;
  max_members: number;
  created_by: string;
  created_at: string;
}

export interface NeighborhoodMember {
  id: string;
  neighborhood_id: string;
  user_id: string;
  role: MemberRole;
  joined_at: string;
  profile?: Profile;
}

export interface Post {
  id: string;
  neighborhood_id: string;
  author_id: string;
  category: PostCategory;
  title: string | null;
  content: string;
  image_urls: string[];
  is_pinned: boolean;
  comment_count: number;
  reaction_count: number;
  ai_summary: string | null;
  created_at: string;
  updated_at: string;
  author?: Profile;
}

export interface Comment {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  created_at: string;
  author?: Profile;
}

export interface GroupOrder {
  id: string;
  neighborhood_id: string;
  organizer_id: string;
  title: string;
  description: string | null;
  vendor: string;
  status: OrderStatus;
  target_households: number;
  current_households: number;
  total_amount: number;
  deadline: string;
  estimated_delivery: string | null;
  ai_suggestion: string | null;
  created_at: string;
  organizer?: Profile;
}

export interface OrderItem {
  id: string;
  order_id: string;
  name: string;
  unit_price: number;
  quantity: number;
  total: number;
}

export interface Resource {
  id: string;
  neighborhood_id: string;
  owner_id: string;
  name: string;
  description: string | null;
  category: 'tools' | 'equipment' | 'spaces' | 'vehicles' | 'other';
  condition: 'excellent' | 'good' | 'fair';
  deposit_amount: number;
  image_urls: string[];
  is_available: boolean;
  created_at: string;
  owner?: Profile;
}

export interface ResourceBooking {
  id: string;
  resource_id: string;
  borrower_id: string;
  start_date: string;
  end_date: string;
  notes: string | null;
  status: 'pending' | 'approved' | 'active' | 'returned' | 'cancelled';
  created_at: string;
  borrower?: Profile;
}

export interface Proposal {
  id: string;
  neighborhood_id: string;
  proposer_id: string;
  title: string;
  description: string;
  vote_method: VoteMethod;
  status: VoteStatus;
  quorum_required: number;
  current_participation: number;
  total_households: number;
  deadline: string;
  ai_summary: string | null;
  options: string[];
  result: string | null;
  created_at: string;
  proposer?: Profile;
}

export interface Vote {
  id: string;
  proposal_id: string;
  voter_id: string;
  choice: string | string[];
  ranking: number[] | null;
  created_at: string;
}

export interface Event {
  id: string;
  neighborhood_id: string;
  organizer_id: string;
  title: string;
  description: string | null;
  location: string;
  start_time: string;
  end_time: string | null;
  max_attendees: number | null;
  rsvp_count: number;
  maybe_count: number;
  contributions_needed: string[];
  created_at: string;
  organizer?: Profile;
}

export interface EventRsvpRecord {
  id: string;
  event_id: string;
  user_id: string;
  status: EventRsvp;
  contribution: string | null;
  created_at: string;
}

export interface TreasuryEntry {
  id: string;
  neighborhood_id: string;
  created_by: string;
  type: 'income' | 'expense';
  amount: number;
  category: TreasuryCategory;
  description: string;
  receipt_url: string | null;
  date: string;
  created_at: string;
  author?: Profile;
}

export interface Message {
  id: string;
  channel_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  sender?: Profile;
}

export interface Channel {
  id: string;
  neighborhood_id: string;
  name: string;
  type: 'group' | 'dm';
  member_ids: string[];
  last_message: string | null;
  unread_count: number;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: 'post' | 'comment' | 'vote' | 'order' | 'event' | 'resource' | 'alert' | 'system';
  title: string;
  body: string;
  action_url: string | null;
  is_read: boolean;
  created_at: string;
}

// Supabase Database type
export interface Database {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: Partial<Profile>; Update: Partial<Profile>; };
      neighborhoods: { Row: Neighborhood; Insert: Partial<Neighborhood>; Update: Partial<Neighborhood>; };
      neighborhood_members: { Row: NeighborhoodMember; Insert: Partial<NeighborhoodMember>; Update: Partial<NeighborhoodMember>; };
      posts: { Row: Post; Insert: Partial<Post>; Update: Partial<Post>; };
      comments: { Row: Comment; Insert: Partial<Comment>; Update: Partial<Comment>; };
      group_orders: { Row: GroupOrder; Insert: Partial<GroupOrder>; Update: Partial<GroupOrder>; };
      order_items: { Row: OrderItem; Insert: Partial<OrderItem>; Update: Partial<OrderItem>; };
      resources: { Row: Resource; Insert: Partial<Resource>; Update: Partial<Resource>; };
      resource_bookings: { Row: ResourceBooking; Insert: Partial<ResourceBooking>; Update: Partial<ResourceBooking>; };
      proposals: { Row: Proposal; Insert: Partial<Proposal>; Update: Partial<Proposal>; };
      votes: { Row: Vote; Insert: Partial<Vote>; Update: Partial<Vote>; };
      events: { Row: Event; Insert: Partial<Event>; Update: Partial<Event>; };
      event_rsvps: { Row: EventRsvpRecord; Insert: Partial<EventRsvpRecord>; Update: Partial<EventRsvpRecord>; };
      treasury_entries: { Row: TreasuryEntry; Insert: Partial<TreasuryEntry>; Update: Partial<TreasuryEntry>; };
      messages: { Row: Message; Insert: Partial<Message>; Update: Partial<Message>; };
      channels: { Row: Channel; Insert: Partial<Channel>; Update: Partial<Channel>; };
      notifications: { Row: Notification; Insert: Partial<Notification>; Update: Partial<Notification>; };
    };
    Views: {};
    Functions: {};
    Enums: {};
  };
}
