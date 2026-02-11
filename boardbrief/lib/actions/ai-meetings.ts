'use server';

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
