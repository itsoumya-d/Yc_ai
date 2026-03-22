import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getProposalAnalytics } from '@/lib/actions/proposals';

// getProposalAnalytics calls: createClient() → .from('proposal_view_events')
//   .select('viewed_at, viewer_name, time_spent_seconds')
//   .eq('proposal_id', proposalId)
//   .order('viewed_at', { ascending: false })
//   .limit(10)
// The terminal call is .limit(); mock the full chain.

const mockLimit = vi.fn();
const mockOrder = vi.fn(() => ({ limit: mockLimit }));
const mockEq = vi.fn(() => ({ order: mockOrder }));
const mockSelect = vi.fn(() => ({ eq: mockEq }));
const mockFrom = vi.fn(() => ({ select: mockSelect }));

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

describe('getProposalAnalytics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Re-wire the chain after clearAllMocks resets return values
    mockOrder.mockReturnValue({ limit: mockLimit });
    mockEq.mockReturnValue({ order: mockOrder });
    mockSelect.mockReturnValue({ eq: mockEq });
    mockFrom.mockReturnValue({ select: mockSelect });
  });

  it('returns zero views when there are no view events', async () => {
    mockLimit.mockResolvedValue({ data: [], error: null });

    const result = await getProposalAnalytics('proposal-1');

    expect(result.totalViews).toBe(0);
    expect(result.viewEvents).toHaveLength(0);
    expect(result.avgTimeSeconds).toBe(0);
    expect(result.lastViewedAt).toBeUndefined();
  });

  it('returns correct totalViews and lastViewedAt for multiple events', async () => {
    const mockEvents = [
      { viewed_at: '2026-03-02T14:00:00Z', viewer_name: 'Alice', time_spent_seconds: 90 },
      { viewed_at: '2026-03-01T10:00:00Z', viewer_name: 'Bob', time_spent_seconds: 30 },
    ];
    mockLimit.mockResolvedValue({ data: mockEvents, error: null });

    const result = await getProposalAnalytics('proposal-1');

    expect(result.totalViews).toBe(2);
    expect(result.lastViewedAt).toBe('2026-03-02T14:00:00Z');
    expect(result.viewEvents).toHaveLength(2);
  });

  it('calculates average time spent correctly', async () => {
    const mockEvents = [
      { viewed_at: '2026-03-01T10:00:00Z', viewer_name: 'Alice', time_spent_seconds: 60 },
      { viewed_at: '2026-03-02T10:00:00Z', viewer_name: 'Bob', time_spent_seconds: 120 },
    ];
    mockLimit.mockResolvedValue({ data: mockEvents, error: null });

    const result = await getProposalAnalytics('proposal-1');

    // avg of 60 and 120 = 90
    expect(result.avgTimeSeconds).toBe(90);
  });

  it('handles null events from DB gracefully (treats as empty array)', async () => {
    mockLimit.mockResolvedValue({ data: null, error: { message: 'DB error' } });

    const result = await getProposalAnalytics('proposal-1');

    expect(result.totalViews).toBe(0);
    expect(result.viewEvents).toHaveLength(0);
  });

  it('passes the correct proposalId to the eq filter', async () => {
    mockLimit.mockResolvedValue({ data: [], error: null });

    await getProposalAnalytics('proposal-abc-123');

    expect(mockEq).toHaveBeenCalledWith('proposal_id', 'proposal-abc-123');
  });

  it('returns a single view event with correct shape', async () => {
    const mockEvents = [
      { viewed_at: '2026-03-05T09:00:00Z', viewer_name: 'Charlie', time_spent_seconds: 200 },
    ];
    mockLimit.mockResolvedValue({ data: mockEvents, error: null });

    const result = await getProposalAnalytics('proposal-2');

    expect(result.totalViews).toBe(1);
    expect(result.avgTimeSeconds).toBe(200);
    expect(result.lastViewedAt).toBe('2026-03-05T09:00:00Z');
  });
});
