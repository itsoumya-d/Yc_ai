// AI: OpenAI conversational wishes guidance and document categorization
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY || '',
});

const SYSTEM_PROMPT = `You are Mortal, a warm and empathetic AI guide helping people document their end-of-life wishes. Your role is to gently guide conversations about funeral preferences, organ donation, care directives, messages to loved ones, and legacy planning. Be compassionate, never clinical. Acknowledge the courage it takes to have these conversations. Ask one question at a time. When someone shares something personal, acknowledge it warmly before moving on.`;

export async function chatWithWishesAI(
  messages: { role: 'user' | 'assistant'; content: string }[]
): Promise<string> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages,
    ],
    max_tokens: 500,
    temperature: 0.7,
  });
  return response.choices[0]?.message?.content ?? "I'm here to listen. Please share what's on your mind.";
}

export async function sendWishesMessage(
  messages: { role: 'user' | 'assistant'; content: string }[],
  categoryContext: string
): Promise<string> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT + `\n\nCurrent focus: ${categoryContext}` },
      ...messages,
    ],
    max_tokens: 500,
    temperature: 0.7,
  });
  return response.choices[0]?.message?.content ?? "I am here to listen. Please share what is on your mind.";
}

export async function categorizeDocument(
  fileName: string,
  fileType: string
): Promise<{ category: string; summary: string }> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'user',
        content: `Categorize this document for an end-of-life planning app.\nFile: ${fileName}\nType: ${fileType}\n\nRespond in JSON: {"category": "legal|medical|financial|insurance|personal|other", "summary": "brief description of what this document likely contains"}`,
      },
    ],
    response_format: { type: 'json_object' },
    max_tokens: 150,
  });
  try {
    const content = response.choices[0]?.message?.content ?? '{}';
    const parsed = JSON.parse(content);
    return { category: parsed.category ?? 'other', summary: parsed.summary ?? 'Document uploaded' };
  } catch {
    return { category: 'other', summary: 'Document uploaded to your vault' };
  }
}
