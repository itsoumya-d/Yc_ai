import { z } from 'zod';

export const storySchema = z.object({
  title: z.string().min(3).max(200),
  genre: z.enum(['fantasy', 'sci-fi', 'romance', 'thriller', 'mystery', 'literary', 'horror', 'adventure']),
  premise: z.string().min(20).max(1000),
  targetWordCount: z.number().int().min(1000).max(200000).optional(),
});

export const chapterSchema = z.object({
  storyId: z.string().uuid(),
  title: z.string().min(1).max(200),
  content: z.string().min(10).max(50000),
  orderIndex: z.number().int().min(0),
});

export const aiWriteSchema = z.object({
  storyId: z.string().uuid(),
  chapterId: z.string().uuid().optional(),
  prompt: z.string().min(10).max(500),
  style: z.enum(['descriptive', 'dialogue-heavy', 'action', 'introspective']).optional(),
});

export const commentSchema = z.object({
  chapterId: z.string().uuid(),
  content: z.string().min(1).max(1000),
  selection: z.string().optional(),
});

export type StoryInput = z.infer<typeof storySchema>;
export type ChapterInput = z.infer<typeof chapterSchema>;
export type AIWriteInput = z.infer<typeof aiWriteSchema>;
export type CommentInput = z.infer<typeof commentSchema>;
