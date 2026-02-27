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

export interface MeetingMinutes {
  title:       string;
  date:        string;
  duration:    string;
  attendees:   string[];
  callToOrder: string;
  agenda:      string[];
  discussion:  string;
  decisions:   string[];
  actionItems: string[];
  adjournment: string;
  rawText:     string;
}

export async function generateMeetingMinutes(
  meetingTitle: string,
  meetingType: string,
  scheduledAt: string | null,
  durationMinutes: number,
  notes: string,
  actionItemsText: string,
  resolutionsText: string,
  attendees: string
): Promise<ActionResult<MeetingMinutes>> {
  const dateStr = scheduledAt
    ? new Date(scheduledAt).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    : '';

  const contextParts = [
    `Meeting: ${meetingTitle} (${meetingType})`,
    dateStr ? `Date: ${dateStr}` : '',
    `Duration: ${durationMinutes} minutes`,
    attendees ? `Attendees: ${attendees}` : '',
    notes ? `Notes / Agenda: ${notes}` : '',
    actionItemsText ? `Action Items:\n${actionItemsText}` : '',
    resolutionsText ? `Resolutions:\n${resolutionsText}` : '',
  ].filter(Boolean).join('\n\n');

  const result = await generateMeetingAI(
    'summary',
    `Generate complete, formal board meeting minutes (not just a summary) for: "${meetingTitle}". Include: call to order, attendees, agenda items with discussion, decisions made, action items assigned, and adjournment.`,
    contextParts
  );

  if (result.error || !result.data) return { error: result.error ?? 'No content generated' };

  const raw = result.data;
  const lines = raw.split('\n').map((l) => l.trim()).filter(Boolean);

  const minutes: MeetingMinutes = {
    title:       meetingTitle,
    date:        dateStr || 'Date TBD',
    duration:    `${durationMinutes} minutes`,
    attendees:   attendees ? attendees.split(',').map((a) => a.trim()).filter(Boolean) : [],
    callToOrder: '',
    agenda:      [],
    discussion:  '',
    decisions:   [],
    actionItems: actionItemsText ? actionItemsText.split('\n').filter(Boolean) : [],
    adjournment: '',
    rawText:     raw,
  };

  let currentSection = '';
  for (const line of lines) {
    const lower = line.toLowerCase();
    if (lower.includes('call to order') || lower.includes('called to order')) {
      minutes.callToOrder = line;
      currentSection = '';
    } else if (lower.match(/agenda/) || lower.match(/item\s+\d/)) {
      currentSection = 'agenda';
    } else if (lower.includes('discussion') || lower.includes('business')) {
      currentSection = 'discussion';
    } else if (lower.includes('resolved') || lower.includes('voted') || lower.includes('motion passed')) {
      if (!minutes.decisions.includes(line)) minutes.decisions.push(line);
    } else if (lower.includes('adjourned') || lower.includes('next meeting')) {
      minutes.adjournment = line;
    } else {
      if (currentSection === 'agenda' && line.match(/^[-•*\d]/)) {
        minutes.agenda.push(line.replace(/^[-•*\d.]\s*/, ''));
      } else if (currentSection === 'discussion') {
        minutes.discussion += (minutes.discussion ? ' ' : '') + line;
      }
    }
  }

  return { data: minutes };
}
