'use server';

import { createClient } from '@/lib/supabase/server';
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

export async function generateMeetingPackHTML(meetingId: string): Promise<string> {
  'use server';
  const supabase = await createClient();

  const [meetingRes, actionsRes, resolutionsRes] = await Promise.all([
    supabase.from('meetings').select('*').eq('id', meetingId).single(),
    supabase.from('action_items').select('*').eq('meeting_id', meetingId).order('created_at'),
    supabase.from('resolutions').select('*').eq('meeting_id', meetingId).order('created_at'),
  ]);

  const meeting = meetingRes.data;
  if (!meeting) return '<html><body><p>Meeting not found.</p></body></html>';

  const actionItems = actionsRes.data ?? [];
  const resolutions = resolutionsRes.data ?? [];

  const meetingDate = meeting.scheduled_at
    ? new Date(meeting.scheduled_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<title>Board Pack — ${meeting.title}</title>
<style>
  @media print {
    body { margin: 0; }
    .no-print { display: none; }
  }
  body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 48px; color: #111827; max-width: 900px; margin: 0 auto; }
  h1 { font-size: 26px; border-bottom: 3px solid #1D4ED8; padding-bottom: 14px; color: #1D4ED8; margin-bottom: 6px; }
  .subtitle { color: #6B7280; font-size: 13px; margin-bottom: 32px; }
  h2 { font-size: 11px; color: #374151; margin: 28px 0 12px; text-transform: uppercase; letter-spacing: 0.08em; font-weight: 700; border-bottom: 1px solid #F3F4F6; padding-bottom: 6px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 13px; }
  th { background: #F9FAFB; text-align: left; padding: 10px 12px; font-size: 11px; color: #6B7280; font-weight: 600; border-bottom: 2px solid #E5E7EB; }
  td { padding: 10px 12px; border-bottom: 1px solid #F3F4F6; vertical-align: top; }
  tr:last-child td { border-bottom: none; }
  .badge { display: inline-block; padding: 2px 8px; border-radius: 9999px; font-size: 10px; font-weight: 700; letter-spacing: 0.03em; }
  .badge-passed { background: #D1FAE5; color: #065F46; }
  .badge-pending { background: #DBEAFE; color: #1E40AF; }
  .badge-failed { background: #FEE2E2; color: #991B1B; }
  .badge-done { background: #D1FAE5; color: #065F46; }
  .badge-in-progress { background: #FEF3C7; color: #92400E; }
  .meta-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin-bottom: 32px; }
  .meta-item { background: #F9FAFB; border-radius: 8px; padding: 12px 16px; }
  .meta-label { font-size: 10px; color: #9CA3AF; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 4px; }
  .meta-value { font-size: 14px; font-weight: 600; color: #111827; }
  .footer { margin-top: 48px; font-size: 10px; color: #9CA3AF; border-top: 1px solid #E5E7EB; padding-top: 12px; display: flex; justify-content: space-between; }
  .print-btn { position: fixed; top: 20px; right: 20px; background: #1D4ED8; color: white; border: none; padding: 10px 20px; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; }
</style>
</head>
<body>
<button class="print-btn no-print" onclick="window.print()">Print / Save PDF</button>

<h1>Board Meeting Pack</h1>
<p class="subtitle">${meeting.title} &bull; ${meetingDate}</p>

<div class="meta-grid">
  <div class="meta-item">
    <div class="meta-label">Meeting Type</div>
    <div class="meta-value">${meeting.meeting_type ?? 'Board Meeting'}</div>
  </div>
  <div class="meta-item">
    <div class="meta-label">Duration</div>
    <div class="meta-value">${meeting.duration_minutes ?? 60} minutes</div>
  </div>
  <div class="meta-item">
    <div class="meta-label">Status</div>
    <div class="meta-value">${meeting.status ?? 'Draft'}</div>
  </div>
</div>

${meeting.notes ? `
<h2>Notes &amp; Agenda</h2>
<p style="font-size:13px;line-height:1.7;white-space:pre-wrap;color:#374151;">${meeting.notes}</p>
` : ''}

${resolutions.length > 0 ? `
<h2>Resolutions (${resolutions.length})</h2>
<table>
  <thead><tr><th>Resolution</th><th>Status</th><th>Votes For</th><th>Votes Against</th></tr></thead>
  <tbody>
    ${resolutions.map((r: Record<string, unknown>) => `
    <tr>
      <td>${r.title}</td>
      <td><span class="badge badge-${r.status === 'passed' ? 'passed' : r.status === 'failed' ? 'failed' : 'pending'}">${String(r.status ?? 'pending')}</span></td>
      <td>${(r.votes_for as number) ?? 0}</td>
      <td>${(r.votes_against as number) ?? 0}</td>
    </tr>`).join('')}
  </tbody>
</table>
` : ''}

${actionItems.length > 0 ? `
<h2>Action Items (${actionItems.length})</h2>
<table>
  <thead><tr><th>Task</th><th>Assignee</th><th>Due Date</th><th>Status</th></tr></thead>
  <tbody>
    ${actionItems.map((a: Record<string, unknown>) => `
    <tr>
      <td>${a.title}</td>
      <td>${(a.assignee_name as string) ?? '—'}</td>
      <td>${a.due_date ? new Date(a.due_date as string).toLocaleDateString() : '—'}</td>
      <td><span class="badge badge-${a.status === 'done' ? 'done' : a.status === 'in_progress' ? 'in-progress' : 'pending'}">${String(a.status ?? 'pending').replace('_', ' ')}</span></td>
    </tr>`).join('')}
  </tbody>
</table>
` : ''}

<div class="footer">
  <span>Generated by BoardBrief &bull; ${new Date().toLocaleString()}</span>
  <span>CONFIDENTIAL — For board members only</span>
</div>
</body>
</html>`;

  return html;
}
