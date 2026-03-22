import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateMeetingPackHTML } from '@/lib/actions/ai-meetings';

// generateMeetingPackHTML uses Promise.all with three queries:
//   1. supabase.from('meetings').select('*').eq('id', meetingId).single()
//   2. supabase.from('action_items').select('*').eq('meeting_id', meetingId).order('created_at')
//   3. supabase.from('resolutions').select('*').eq('meeting_id', meetingId).order('created_at')
// There is no auth/getUser check — the function runs as a server action without authentication.

const mockMeetingsSingle = vi.fn();
const mockActionItemsOrder = vi.fn();
const mockResolutionsOrder = vi.fn();

// Track which table is being queried so we can return the right mock
const mockFrom = vi.fn((table: string) => {
  if (table === 'meetings') {
    return {
      select: vi.fn(() => ({
        eq: vi.fn(() => ({ single: mockMeetingsSingle })),
      })),
    };
  }
  if (table === 'action_items') {
    return {
      select: vi.fn(() => ({
        eq: vi.fn(() => ({ order: mockActionItemsOrder })),
      })),
    };
  }
  if (table === 'resolutions') {
    return {
      select: vi.fn(() => ({
        eq: vi.fn(() => ({ order: mockResolutionsOrder })),
      })),
    };
  }
  return { select: vi.fn() };
});

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() =>
    Promise.resolve({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-1' } } }),
      },
      from: mockFrom,
    })
  ),
}));

// generateMeetingPackHTML does NOT call OpenAI — it builds HTML from DB data directly.
// No need to mock openai here.

const baseMeeting = {
  id: 'meeting-1',
  title: 'Q1 Board Meeting',
  scheduled_at: '2026-03-15T10:00:00Z',
  meeting_type: 'Board Meeting',
  duration_minutes: 60,
  status: 'draft',
  notes: 'Discussed Q1 performance metrics',
};

describe('generateMeetingPackHTML', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: meeting found, no action items, no resolutions
    mockMeetingsSingle.mockResolvedValue({ data: baseMeeting, error: null });
    mockActionItemsOrder.mockResolvedValue({ data: [], error: null });
    mockResolutionsOrder.mockResolvedValue({ data: [], error: null });
  });

  it('returns an HTML string for a valid meeting', async () => {
    const result = await generateMeetingPackHTML('meeting-1');

    expect(typeof result).toBe('string');
    expect(result).toContain('<!DOCTYPE html>');
    expect(result).toContain('<html>');
  });

  it('includes the meeting title in the output', async () => {
    const result = await generateMeetingPackHTML('meeting-1');

    expect(result).toContain('Q1 Board Meeting');
  });

  it('returns fallback HTML when meeting is not found', async () => {
    mockMeetingsSingle.mockResolvedValue({ data: null, error: { message: 'Not found' } });

    const result = await generateMeetingPackHTML('nonexistent');

    expect(typeof result).toBe('string');
    expect(result).toContain('Meeting not found');
  });

  it('includes resolution table when resolutions are present', async () => {
    mockResolutionsOrder.mockResolvedValue({
      data: [
        { title: 'Approve Q1 Budget', status: 'passed', votes_for: 5, votes_against: 0 },
      ],
      error: null,
    });

    const result = await generateMeetingPackHTML('meeting-1');

    expect(result).toContain('Approve Q1 Budget');
    expect(result).toContain('Resolutions');
  });

  it('includes action items table when action items are present', async () => {
    mockActionItemsOrder.mockResolvedValue({
      data: [
        { title: 'Prepare Q2 forecast', assignee_name: 'Alice', due_date: '2026-04-01', status: 'pending' },
      ],
      error: null,
    });

    const result = await generateMeetingPackHTML('meeting-1');

    expect(result).toContain('Prepare Q2 forecast');
    expect(result).toContain('Action Items');
  });

  it('omits resolution and action item sections when both are empty', async () => {
    const result = await generateMeetingPackHTML('meeting-1');

    // Tables are only rendered when data length > 0
    expect(result).not.toContain('<th>Resolution</th>');
    expect(result).not.toContain('<th>Task</th>');
  });

  it('includes notes section when meeting has notes', async () => {
    const result = await generateMeetingPackHTML('meeting-1');

    expect(result).toContain('Discussed Q1 performance metrics');
  });

  it('omits notes section when meeting has no notes', async () => {
    mockMeetingsSingle.mockResolvedValue({
      data: { ...baseMeeting, notes: null },
      error: null,
    });

    const result = await generateMeetingPackHTML('meeting-1');

    // The notes section is only rendered when meeting.notes is truthy
    expect(result).not.toContain('Notes &amp; Agenda');
  });
});
