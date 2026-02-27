import { describe, it, expect } from 'vitest';
import { storyFormSchema, chapterFormSchema, characterFormSchema, worldElementFormSchema } from '../validations';

describe('storyFormSchema', () => {
  const validStory = {
    title: 'The Great Adventure',
    description: 'An epic tale of courage',
    genre: 'fantasy' as const,
    tags: ['epic', 'adventure'],
  };

  it('accepts valid story data', () => {
    const result = storyFormSchema.safeParse(validStory);
    expect(result.success).toBe(true);
  });

  it('rejects empty title', () => {
    const result = storyFormSchema.safeParse({ ...validStory, title: '' });
    expect(result.success).toBe(false);
  });

  it('rejects title over 200 chars', () => {
    const result = storyFormSchema.safeParse({ ...validStory, title: 'A'.repeat(201) });
    expect(result.success).toBe(false);
  });

  it('accepts minimal required fields', () => {
    const result = storyFormSchema.safeParse({ title: 'Short Story' });
    expect(result.success).toBe(true);
  });

  it('rejects invalid genre', () => {
    const result = storyFormSchema.safeParse({ ...validStory, genre: 'not_a_genre' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid cover_url', () => {
    const result = storyFormSchema.safeParse({ ...validStory, cover_url: 'not-url' });
    expect(result.success).toBe(false);
  });

  it('rejects more than 20 tags', () => {
    const tooManyTags = Array.from({ length: 21 }, (_, i) => `tag${i}`);
    const result = storyFormSchema.safeParse({ ...validStory, tags: tooManyTags });
    expect(result.success).toBe(false);
  });
});

describe('chapterFormSchema', () => {
  const validChapter = {
    story_id: '550e8400-e29b-41d4-a716-446655440000',
    title: 'Chapter One: The Beginning',
    content: 'It was a dark and stormy night...',
  };

  it('accepts valid chapter data', () => {
    const result = chapterFormSchema.safeParse(validChapter);
    expect(result.success).toBe(true);
  });

  it('rejects empty title', () => {
    const result = chapterFormSchema.safeParse({ ...validChapter, title: '' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid story_id', () => {
    const result = chapterFormSchema.safeParse({ ...validChapter, story_id: 'not-uuid' });
    expect(result.success).toBe(false);
  });
});

describe('characterFormSchema', () => {
  const validCharacter = {
    story_id: '550e8400-e29b-41d4-a716-446655440000',
    name: 'Aria Windwalker',
    role: 'protagonist' as const,
    description: 'A brave warrior',
    traits: ['brave', 'clever'],
  };

  it('accepts valid character data', () => {
    const result = characterFormSchema.safeParse(validCharacter);
    expect(result.success).toBe(true);
  });

  it('rejects empty name', () => {
    const result = characterFormSchema.safeParse({ ...validCharacter, name: '' });
    expect(result.success).toBe(false);
  });

  it('rejects more than 20 traits', () => {
    const tooManyTraits = Array.from({ length: 21 }, (_, i) => `trait${i}`);
    const result = characterFormSchema.safeParse({ ...validCharacter, traits: tooManyTraits });
    expect(result.success).toBe(false);
  });
});

describe('worldElementFormSchema', () => {
  it('accepts valid world element', () => {
    const result = worldElementFormSchema.safeParse({
      story_id: '550e8400-e29b-41d4-a716-446655440000',
      name: 'The Crystal Tower',
      element_type: 'location',
      description: 'A towering spire of pure crystal',
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty name', () => {
    const result = worldElementFormSchema.safeParse({
      story_id: '550e8400-e29b-41d4-a716-446655440000',
      name: '',
      element_type: 'location',
    });
    expect(result.success).toBe(false);
  });
});
