import OpenAI from 'openai';

const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY ?? '';

export const openai = new OpenAI({
  apiKey,
  dangerouslyAllowBrowser: true,
});

export const MODELS = {
  CHAT: 'gpt-4o',
  MINI: 'gpt-4o-mini',
} as const;
