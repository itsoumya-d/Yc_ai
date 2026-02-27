'use server';

import OpenAI from 'openai';
import { generateMeetingAI } from './openai';

interface ActionResult<T = null> { data?: T; error?: string; }

export async function generateAgenda(
  meetingTitle: string,
  meetingType: string,
  notes: string,
  duration: number
): Promise<ActionResult<string>> {
  return generateMeetingAI(
    'agenda',
    `Generate an agenda for: "${meetingTitle}" (${meetingType} meeting, ${duration} minutes)`,
    notes || 'No additional context provided.'
  );
}

export async function generateMeetingSummary(
  meetingTitle: string,
  notes: string,
  actionItems: string
): Promise<ActionResult<string>> {
  return generateMeetingAI(
    'summary',
    `Summarize the meeting: "${meetingTitle}"`,
    `Notes: ${notes || 'None'}\nAction Items: ${actionItems || 'None'}`
  );
}

export async function generateResolutionDraft(
  title: string,
  context: string
): Promise<ActionResult<string>> {
  return generateMeetingAI(
    'resolution',
    `Draft a board resolution titled: "${title}"`,
    context || 'No additional context.'
  );
}

export interface ExtractedActionItem {
  title: string;
  assignee_name: string | null;
  priority: 'high' | 'medium' | 'low';
  description: string | null;
}

export async function extractActionItemsFromNotes(
  notes: string,
): Promise<ActionResult<ExtractedActionItem[]>> {
  if (!notes.trim()) return { error: 'No notes provided' };
  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: 'You are a board meeting assistant that extracts action items from meeting notes or transcripts. Return a JSON object with an "items" array. Each item must have: title (string — concise, verb-first action, max 80 chars), assignee_name (string or null — the person responsible), priority ("high", "medium", or "low" — based on urgency/importance), description (string or null — brief additional context, max 120 chars). Focus only on concrete, delegated tasks with clear owners where identifiable.',
        },
        {
          role: 'user',
          content: `Extract all action items from these meeting notes:\n\n${notes}`,
        },
      ],
      temperature: 0.2,
      max_tokens: 2000,
    });
    const content = response.choices[0]?.message?.content;
    if (!content) return { error: 'No content generated' };
    const parsed = JSON.parse(content) as { items?: unknown };
    if (!Array.isArray(parsed.items)) return { error: 'Unexpected response format' };
    const items = parsed.items as ExtractedActionItem[];
    return { data: items };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to extract action items' };
  }
}
