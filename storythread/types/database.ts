export interface User {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  pen_name: string | null;
  favorite_genres: string[];
  created_at: string;
  updated_at: string;
}

export type StoryStatus = 'draft' | 'in_progress' | 'completed' | 'published' | 'archived';
export type StoryGenre = 'fantasy' | 'sci_fi' | 'romance' | 'mystery' | 'horror' | 'literary' | 'thriller' | 'historical' | 'adventure' | 'comedy' | 'drama' | 'other';

export interface Story {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  genre: StoryGenre;
  status: StoryStatus;
  cover_url: string | null;
  tags: string[];
  total_word_count: number;
  chapter_count: number;
  created_at: string;
  updated_at: string;
}

export type ChapterStatus = 'draft' | 'published' | 'scheduled';

export interface Chapter {
  id: string;
  story_id: string;
  title: string;
  content: string;
  status: ChapterStatus;
  order_index: number;
  word_count: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type CharacterRole = 'protagonist' | 'antagonist' | 'supporting' | 'minor' | 'mentioned';

export interface Character {
  id: string;
  story_id: string;
  name: string;
  role: CharacterRole;
  appearance: string | null;
  personality: string | null;
  backstory: string | null;
  voice_notes: string | null;
  relationships: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export type WorldElementType = 'location' | 'lore' | 'rule' | 'event' | 'item' | 'faction';

export interface WorldElement {
  id: string;
  story_id: string;
  name: string;
  type: WorldElementType;
  description: string | null;
  details: string | null;
  created_at: string;
  updated_at: string;
}

export type AIActionType = 'continue' | 'dialogue' | 'rephrase' | 'fix_prose';

export interface AIGeneration {
  id: string;
  user_id: string;
  story_id: string;
  chapter_id: string | null;
  action_type: AIActionType;
  prompt: string;
  result: string;
  tokens_used: number;
  model: string;
  created_at: string;
}

export interface StoryWithChapters extends Story {
  chapters: Chapter[];
}

export interface StoryWithDetails extends Story {
  chapters: Chapter[];
  characters: Character[];
  world_elements: WorldElement[];
}

export type ReactionType = 'like' | 'love' | 'fire' | 'mind_blown' | 'sad';

export interface Comment {
  id: string;
  story_id: string;
  chapter_id: string | null;
  user_id: string;
  parent_id: string | null;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface CommentWithAuthor extends Comment {
  author_name: string | null;
  author_pen_name: string | null;
  replies?: CommentWithAuthor[];
}

export interface Reaction {
  id: string;
  story_id: string;
  chapter_id: string | null;
  user_id: string;
  reaction_type: ReactionType;
  created_at: string;
}

export interface ReactionCounts {
  like: number;
  love: number;
  fire: number;
  mind_blown: number;
  sad: number;
  userReaction: ReactionType | null;
}

export interface StoryFollow {
  id: string;
  follower_id: string;
  author_id: string;
  created_at: string;
}

export interface PublicAuthor {
  id: string;
  full_name: string | null;
  pen_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  story_count: number;
  total_word_count: number;
  follower_count: number;
}

export interface WritingSession {
  id: string;
  user_id: string;
  story_id: string;
  chapter_id: string | null;
  words_written: number;
  session_date: string;
  created_at: string;
}

export interface PublicStoryCard extends Story {
  author_name: string | null;
  author_pen_name: string | null;
  reaction_count: number;
  comment_count: number;
}
