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

export type AIActionType =
  | 'continue'
  | 'continue_dramatic'
  | 'continue_subtle'
  | 'continue_action'
  | 'continue_dialogue'
  | 'dialogue'
  | 'improve_dialogue'
  | 'rephrase'
  | 'fix_prose'
  | 'enhance_description'
  | 'consistency_check'
  | 'plot_hole_detect'
  | 'readability_score'
  | 'tone_analyze'
  | 'pacing_analyze';

export interface WritingSession {
  id: string;
  user_id: string;
  story_id: string | null;
  words_written: number;
  duration_minutes: number;
  started_at: string;
  ended_at: string | null;
}

export interface UserGoals {
  user_id: string;
  daily_word_goal: number;
  streak_days: number;
  longest_streak: number;
  total_words_all_time: number;
  words_today: number;
  updated_at: string;
}

export interface WritingStats {
  wordsToday: number;
  wordsThisWeek: number;
  wordsThisMonth: number;
  currentStreak: number;
  longestStreak: number;
  dailyGoal: number;
  averageSessionWords: number;
  bestHour: number | null;
}

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
