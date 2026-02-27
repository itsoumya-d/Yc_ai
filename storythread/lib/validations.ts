import { z } from 'zod';

export const storyFormSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be under 200 characters'),
  description: z.string().max(2000, 'Description must be under 2000 characters').optional().nullable(),
  genre: z.enum(['fantasy', 'science_fiction', 'mystery', 'romance', 'thriller', 'horror', 'literary', 'historical', 'adventure', 'comedy', 'drama', 'other']).default('other'),
  cover_url: z.string().url('Invalid URL').optional().nullable(),
  tags: z.array(z.string().max(50)).max(20, 'Maximum 20 tags allowed').optional().default([]),
});

export const chapterFormSchema = z.object({
  story_id: z.string().uuid('Invalid story ID'),
  title: z.string().min(1, 'Chapter title is required').max(200),
  content: z.string().max(500000, 'Content exceeds maximum length').optional().default(''),
  order_index: z.number().int().min(0).optional(),
  status: z.enum(['draft', 'revision', 'final']).optional().default('draft'),
});

export const characterFormSchema = z.object({
  story_id: z.string().uuid('Invalid story ID'),
  name: z.string().min(1, 'Character name is required').max(200),
  role: z.enum(['protagonist', 'antagonist', 'supporting', 'minor', 'other']).optional().default('other'),
  description: z.string().max(5000).optional().nullable(),
  backstory: z.string().max(10000).optional().nullable(),
  traits: z.array(z.string().max(50)).max(20).optional().default([]),
});

export const worldElementFormSchema = z.object({
  story_id: z.string().uuid('Invalid story ID'),
  name: z.string().min(1, 'Name is required').max(200),
  element_type: z.enum(['location', 'item', 'concept', 'faction', 'event', 'other']).default('other'),
  description: z.string().max(5000).optional().nullable(),
});

export type StoryFormData = z.infer<typeof storyFormSchema>;
export type ChapterFormData = z.infer<typeof chapterFormSchema>;
export type CharacterFormData = z.infer<typeof characterFormSchema>;
export type WorldElementFormData = z.infer<typeof worldElementFormSchema>;
