export type WishTopic = 'funeral' | 'organ_donation' | 'care_directives' | 'personal_messages' | 'legacy';

export interface ChatMessage { role: 'user' | 'assistant'; content: string; }

export async function getAIResponse(topic: WishTopic, messages: ChatMessage[]): Promise<string> {
  const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY ?? '';
  if (\!apiKey) return 'AI guidance is not configured. Please add your OpenAI API key.';

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'system', content: SYSTEM_PROMPTS[topic] }, ...messages],
      max_tokens: 400,
      temperature: 0.7,
    }),
  });

  const data = await response.json();
  return data.choices?.[0]?.message?.content ?? 'I apologize, I had trouble responding. Please try again.';
}

export const TOPIC_LABELS: Record<WishTopic, string> = {
  funeral: 'Funeral and Memorial',
  organ_donation: 'Organ Donation',
  care_directives: 'Medical Care Directives',
  personal_messages: 'Personal Messages',
  legacy: 'Legacy and Values',
};

export const TOPIC_DESCRIPTIONS: Record<WishTopic, string> = {
  funeral: 'Document your preferences for your funeral service and memorial',
  organ_donation: 'Share your wishes about organ and tissue donation',
  care_directives: 'Specify your medical care preferences at end of life',
  personal_messages: 'Write heartfelt messages to the people you love',
  legacy: 'Reflect on your life, values, and what you want to leave behind',
};

export const TOPIC_ICONS: Record<WishTopic, string> = {
  funeral: '🕯️',
  organ_donation: '❤️',
  care_directives: '📋',
  personal_messages: '💌',
  legacy: '🌱',
};

const SYSTEM_PROMPTS: Record<WishTopic, string> = {
  funeral: 'You are a compassionate guide helping someone document their funeral and memorial wishes. Ask gentle, specific questions about: preferred burial or cremation, memorial service style (religious/secular/celebration of life), music preferences, readings or poems, who should speak, preferred location, flowers or charitable donations, any specific wishes about their body. Be warm, unhurried, and acknowledge the difficulty of these conversations. Guide one topic at a time.',
  organ_donation: 'You are a caring guide helping someone document their organ and tissue donation wishes. Gently cover: whether they want to be an organ donor, specific organs they wish to donate (or exclude), tissue donation preferences, any religious or personal concerns, and what they want their family to know about this decision. Be respectful of all choices.',
  care_directives: 'You are a compassionate guide helping someone document their end-of-life medical care wishes. Cover: resuscitation preferences (DNR), life support and artificial nutrition wishes, pain management priorities (comfort vs. prolonging life), preferences about dying at home vs. hospital vs. hospice, who should make medical decisions if they cannot, any conditions under which they would not want aggressive treatment. Be clear that these become legally important documents.',
  personal_messages: 'You are a warm guide helping someone write personal messages to their loved ones. Help them think about: who they most want to leave messages for, what they want each person to know about what they meant to them, apologies or reconciliations they want to make, gratitude they want to express, life lessons or wisdom they want to share, and any unfinished emotional business. Treat each relationship as unique and precious.',
  legacy: 'You are a thoughtful guide helping someone think about their legacy. Explore: what they want to be remembered for, values they hope to pass on, stories from their life they want preserved, physical or financial possessions and who should receive them, any charitable causes or organizations they want to support, messages to future generations, and how they hope to have made a difference.',
};
