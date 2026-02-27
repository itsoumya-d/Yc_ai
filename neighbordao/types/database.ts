export type UserRole = 'admin' | 'moderator' | 'member'

export type PostCategory = 'announcement' | 'discussion' | 'event' | 'alert' | 'question'

export type VoteStatus = 'active' | 'passed' | 'failed' | 'cancelled'

export type ResourceStatus = 'available' | 'borrowed' | 'maintenance'

export interface User {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  neighborhood_id: string | null
  role: UserRole
  created_at: string
  updated_at: string
}

export interface Neighborhood {
  id: string
  name: string
  description: string | null
  address: string | null
  city: string
  state: string
  zip_code: string | null
  created_by: string
  member_count: number
  created_at: string
  updated_at: string
}

export interface Post {
  id: string
  title: string
  content: string
  category: PostCategory
  author_id: string
  neighborhood_id: string
  likes_count: number
  comments_count: number
  is_pinned: boolean
  ai_summary: string | null
  created_at: string
  updated_at: string
  author?: User
}

export interface Comment {
  id: string
  post_id: string
  author_id: string
  content: string
  created_at: string
  author?: User
}

export interface Vote {
  id: string
  title: string
  description: string
  neighborhood_id: string
  created_by: string
  status: VoteStatus
  options: VoteOption[]
  total_votes: number
  ends_at: string | null
  created_at: string
  updated_at: string
  creator?: User
}

export interface VoteOption {
  id: string
  vote_id: string
  text: string
  votes_count: number
}

export interface UserVote {
  id: string
  vote_id: string
  user_id: string
  option_id: string
  created_at: string
}

export interface Resource {
  id: string
  name: string
  description: string | null
  category: string
  owner_id: string
  neighborhood_id: string
  status: ResourceStatus
  image_url: string | null
  borrower_id: string | null
  created_at: string
  updated_at: string
  owner?: User
}

export interface ActionResult<T> {
  data?: T
  error?: string
  success: boolean
}