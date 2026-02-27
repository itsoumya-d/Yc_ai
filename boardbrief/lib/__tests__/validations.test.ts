import { describe, it, expect } from 'vitest';
import { meetingFormSchema, boardMemberFormSchema, actionItemFormSchema, resolutionFormSchema } from '../validations';

describe('meetingFormSchema', () => {
  const validMeeting = {
    title: 'Q1 Board Meeting',
    meeting_type: 'regular' as const,
    scheduled_at: '2025-06-15T14:00:00Z',
    duration_minutes: 90,
    location: 'Conference Room A',
  };

  it('accepts valid meeting data', () => {
    const result = meetingFormSchema.safeParse(validMeeting);
    expect(result.success).toBe(true);
  });

  it('rejects empty title', () => {
    const result = meetingFormSchema.safeParse({ ...validMeeting, title: '' });
    expect(result.success).toBe(false);
  });

  it('rejects title over 200 chars', () => {
    const result = meetingFormSchema.safeParse({ ...validMeeting, title: 'A'.repeat(201) });
    expect(result.success).toBe(false);
  });

  it('rejects invalid meeting type', () => {
    const result = meetingFormSchema.safeParse({ ...validMeeting, meeting_type: 'invalid_type' });
    expect(result.success).toBe(false);
  });

  it('rejects duration under 5 minutes', () => {
    const result = meetingFormSchema.safeParse({ ...validMeeting, duration_minutes: 2 });
    expect(result.success).toBe(false);
  });

  it('rejects duration over 24 hours', () => {
    const result = meetingFormSchema.safeParse({ ...validMeeting, duration_minutes: 1500 });
    expect(result.success).toBe(false);
  });

  it('rejects invalid video_link URL', () => {
    const result = meetingFormSchema.safeParse({ ...validMeeting, video_link: 'not-a-url' });
    expect(result.success).toBe(false);
  });

  it('accepts minimal required fields', () => {
    const result = meetingFormSchema.safeParse({ title: 'Quick Sync' });
    expect(result.success).toBe(true);
  });
});

describe('boardMemberFormSchema', () => {
  const validMember = {
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'director' as const,
    title: 'Independent Director',
  };

  it('accepts valid member data', () => {
    const result = boardMemberFormSchema.safeParse(validMember);
    expect(result.success).toBe(true);
  });

  it('rejects empty name', () => {
    const result = boardMemberFormSchema.safeParse({ ...validMember, name: '' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid email', () => {
    const result = boardMemberFormSchema.safeParse({ ...validMember, email: 'not-email' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid date format for term_start', () => {
    const result = boardMemberFormSchema.safeParse({ ...validMember, term_start: 'Jan 2025' });
    expect(result.success).toBe(false);
  });

  it('accepts valid term dates', () => {
    const result = boardMemberFormSchema.safeParse({ ...validMember, term_start: '2025-01-01', term_end: '2028-01-01' });
    expect(result.success).toBe(true);
  });
});

describe('actionItemFormSchema', () => {
  const validAction = {
    meeting_id: '550e8400-e29b-41d4-a716-446655440000',
    title: 'Review Q1 financials',
    priority: 'high' as const,
  };

  it('accepts valid action item', () => {
    const result = actionItemFormSchema.safeParse(validAction);
    expect(result.success).toBe(true);
  });

  it('rejects empty title', () => {
    const result = actionItemFormSchema.safeParse({ ...validAction, title: '' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid meeting_id', () => {
    const result = actionItemFormSchema.safeParse({ ...validAction, meeting_id: 'bad-id' });
    expect(result.success).toBe(false);
  });
});

describe('resolutionFormSchema', () => {
  const validResolution = {
    meeting_id: '550e8400-e29b-41d4-a716-446655440000',
    title: 'Approve annual budget',
    status: 'proposed' as const,
    votes_for: 7,
    votes_against: 1,
    votes_abstain: 0,
  };

  it('accepts valid resolution', () => {
    const result = resolutionFormSchema.safeParse(validResolution);
    expect(result.success).toBe(true);
  });

  it('rejects empty title', () => {
    const result = resolutionFormSchema.safeParse({ ...validResolution, title: '' });
    expect(result.success).toBe(false);
  });

  it('rejects negative votes', () => {
    const result = resolutionFormSchema.safeParse({ ...validResolution, votes_for: -1 });
    expect(result.success).toBe(false);
  });
});
