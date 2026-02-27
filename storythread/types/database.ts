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

// --- Writing Goals & Gamification ---

export type GoalPeriod = 'daily' | 'weekly' | 'monthly';
export type GoalStatus = 'active' | 'completed' | 'failed' | 'paused';

export interface WritingGoal {
  id: string;
  user_id: string;
  target_words: number;
  period: GoalPeriod;
  status: GoalStatus;
  current_words: number;
  started_at: string;
  ends_at: string;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface WritingSession {
  id: string;
  user_id: string;
  story_id: string | null;
  chapter_id: string | null;
  words_written: number;
  duration_minutes: number;
  started_at: string;
  ended_at: string;
  created_at: string;
}

export type AchievementCategory = 'words' | 'streak' | 'stories' | 'chapters' | 'consistency';

export interface Achievement {
  id: string;
  key: string;
  title: string;
  description: string;
  category: AchievementCategory;
  icon: string;
  threshold: number;
  created_at: string;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  unlocked_at: string;
  achievement?: Achievement;
}

export interface WritingStreak {
  id: string;
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_writing_date: string;
  updated_at: string;
}

export interface DashboardStats {
  storyCount: number;
  totalWordCount: number;
  totalChapters: number;
  recentStories: Story[];
  weeklyWordCount: number;
  weeklySessionCount: number;
  weeklyMinutes: number;
  streak: { current: number; longest: number; wroteToday: boolean };
  activeGoals: WritingGoal[];
  recentAchievements: UserAchievement[];
  dailyWordCounts: { date: string; words: number }[];
}
