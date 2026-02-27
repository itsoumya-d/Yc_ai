export interface User {
  id: string;
  email: string;
  full_name: string;
  display_name: string;
  avatar_url: string | null;
  phone: string | null;
  bio: string | null;
  skills: string[];
  address_line: string | null;
  address_verified: boolean;
  auth_provider: string;
  email_verified: boolean;
  notification_preferences: Record<string, boolean>;
  privacy_settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Neighborhood {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  country: string;
  member_count: number;
  household_count: number;
  max_households: number;
  settings: Record<string, unknown>;
  created_by: string;
  cover_image_url: string | null;
  center_lat: number | null;
  center_lng: number | null;
  created_at: string;
  updated_at: string;
}

export interface NeighborhoodMember {
  id: string;
  neighborhood_id: string;
  user_id: string;
  role: 'admin' | 'moderator' | 'treasurer' | 'member';
  status: 'pending' | 'active' | 'suspended' | 'left';
  household_address: string | null;
  household_lat: number | null;
  household_lng: number | null;
  joined_at: string;
  approved_by: string | null;
  created_at: string;
  updated_at: string;
}

export type PostCategory = 'general' | 'event' | 'alert' | 'question' | 'recommendation' | 'lost_found' | 'marketplace' | 'safety';

export interface Post {
  id: string;
  neighborhood_id: string;
  author_id: string;
  parent_id: string | null;
  category: PostCategory;
  title: string | null;
  content: string;
  media_urls: string[];
  is_pinned: boolean;
  is_hidden: boolean;
  comment_count: number;
  reaction_count: number;
  ai_summary: string | null;
  report_count: number;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export type ReactionType = 'like' | 'helpful' | 'thanks';

export interface PostReaction {
  id: string;
  post_id: string;
  user_id: string;
  reaction_type: ReactionType;
  created_at: string;
}

export type EventStatus = 'upcoming' | 'in_progress' | 'completed' | 'cancelled';

export interface Event {
  id: string;
  neighborhood_id: string;
  organizer_id: string;
  title: string;
  description: string | null;
  location_name: string | null;
  location_address: string | null;
  location_lat: number | null;
  location_lng: number | null;
  starts_at: string;
  ends_at: string | null;
  is_recurring: boolean;
  recurrence_rule: string | null;
  max_attendees: number | null;
  rsvp_count: number;
  contributions: unknown[];
  ai_logistics_plan: Record<string, unknown> | null;
  status: EventStatus;
  created_at: string;
  updated_at: string;
}

export type RsvpStatus = 'going' | 'maybe' | 'not_going';

export interface EventRsvp {
  id: string;
  event_id: string;
  user_id: string;
  status: RsvpStatus;
  contribution: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type OrderStatus = 'open' | 'locked' | 'ordered' | 'delivered' | 'completed' | 'cancelled';
export type PaymentStatus = 'pending' | 'collecting' | 'collected' | 'refunded';

export interface GroupOrder {
  id: string;
  neighborhood_id: string;
  organizer_id: string;
  title: string;
  description: string | null;
  vendor_name: string;
  vendor_contact: string | null;
  status: OrderStatus;
  min_participants: number;
  max_participants: number | null;
  current_participants: number;
  total_amount: number;
  delivery_fee: number;
  estimated_savings_percent: number | null;
  deadline: string;
  estimated_delivery: string | null;
  ai_suggestion: string | null;
  payment_status: PaymentStatus;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export type ItemPaymentStatus = 'unpaid' | 'paid' | 'refunded' | 'failed';

export interface OrderItem {
  id: string;
  group_order_id: string;
  user_id: string;
  item_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  delivery_share: number;
  notes: string | null;
  payment_status: ItemPaymentStatus;
  stripe_payment_intent_id: string | null;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
}

export type ResourceCategory = 'tools' | 'equipment' | 'spaces' | 'vehicles' | 'electronics' | 'other';
export type ResourceCondition = 'excellent' | 'good' | 'fair' | 'needs_repair';
export type ResourceStatus = 'available' | 'booked' | 'unavailable' | 'maintenance' | 'retired';

export interface Resource {
  id: string;
  neighborhood_id: string;
  owner_id: string;
  name: string;
  description: string | null;
  category: ResourceCategory;
  condition: ResourceCondition;
  photo_urls: string[];
  deposit_amount: number;
  is_free: boolean;
  daily_rate: number;
  is_community_owned: boolean;
  booking_count: number;
  average_rating: number;
  total_reviews: number;
  status: ResourceStatus;
  location_lat: number | null;
  location_lng: number | null;
  created_at: string;
  updated_at: string;
}

export type BookingStatus = 'pending' | 'approved' | 'active' | 'returned' | 'overdue' | 'cancelled' | 'disputed';

export interface ResourceBooking {
  id: string;
  resource_id: string;
  borrower_id: string;
  starts_at: string;
  ends_at: string;
  status: BookingStatus;
  deposit_paid: boolean;
  deposit_refunded: boolean;
  notes: string | null;
  return_condition: string | null;
  rating: number | null;
  review_text: string | null;
  created_at: string;
  updated_at: string;
}

export type VotingMethod = 'simple_majority' | 'ranked_choice' | 'approval';
export type VoteStatus = 'draft' | 'active' | 'closed_passed' | 'closed_failed' | 'closed_no_quorum' | 'cancelled';

export interface Vote {
  id: string;
  neighborhood_id: string;
  proposed_by: string;
  title: string;
  description: string;
  voting_method: VotingMethod;
  quorum_percent: number;
  status: VoteStatus;
  deadline: string;
  total_eligible_voters: number;
  total_votes_cast: number;
  result: Record<string, unknown> | null;
  ai_impact_summary: string | null;
  linked_post_id: string | null;
  closed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface VoteOption {
  id: string;
  vote_id: string;
  label: string;
  description: string | null;
  sort_order: number;
  vote_count: number;
  created_at: string;
}

export interface VoteResponse {
  id: string;
  vote_id: string;
  user_id: string;
  selected_option_id: string | null;
  ranked_choices: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export type EntryType = 'income' | 'expense';
export type TreasuryCategory = 'dues' | 'group_purchase' | 'event' | 'maintenance' | 'donation' | 'general' | 'refund';

export interface TreasuryEntry {
  id: string;
  neighborhood_id: string;
  created_by: string;
  entry_type: EntryType;
  category: TreasuryCategory;
  description: string;
  amount: number;
  receipt_url: string | null;
  balance_after: number | null;
  approved_by: string | null;
  approved_at: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export type ProviderCategory = 'plumber' | 'electrician' | 'landscaper' | 'handyman' | 'cleaner' | 'painter' | 'roofer' | 'hvac' | 'pest_control' | 'other';

export interface ServiceProvider {
  id: string;
  neighborhood_id: string | null;
  name: string;
  business_name: string | null;
  category: ProviderCategory;
  description: string | null;
  phone: string | null;
  email: string | null;
  website_url: string | null;
  is_claimed: boolean;
  average_rating: number;
  total_reviews: number;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProviderReview {
  id: string;
  provider_id: string;
  user_id: string;
  rating: number;
  quality_rating: number | null;
  price_rating: number | null;
  reliability_rating: number | null;
  communication_rating: number | null;
  review_text: string | null;
  photo_urls: string[];
  project_description: string | null;
  project_cost: number | null;
  provider_response: string | null;
  created_at: string;
  updated_at: string;
}

export type SubscriptionPlan = 'free' | 'community' | 'hoa';
export type SubscriptionStatus = 'active' | 'past_due' | 'cancelled' | 'trialing';

export interface Subscription {
  id: string;
  neighborhood_id: string;
  plan: SubscriptionPlan;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  status: SubscriptionStatus;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  member_limit: number;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

// Standardized server action return type
export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };
