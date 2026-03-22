import { describe, it, expect, vi } from 'vitest';
import { getDashboardData } from '../lib/actions/dashboard';

vi.mock('../lib/supabase/server', () => ({
  createClient: vi.fn(() => ({
    auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'test-user' } } }) },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({ data: [], count: 0, error: null }),
    })),
  })),
}));

describe('getDashboardData', () => {
  it('returns data structure when authenticated', async () => {
    const result = await getDashboardData();
    expect(result.data).toBeDefined();
    expect(result.data?.meetingCount).toBeGreaterThanOrEqual(0);
  });

  it('returns boardMemberCount in data', async () => {
    const result = await getDashboardData();
    expect(result.data?.boardMemberCount).toBeGreaterThanOrEqual(0);
  });

  it('returns openActionItems in data', async () => {
    const result = await getDashboardData();
    expect(result.data?.openActionItems).toBeGreaterThanOrEqual(0);
  });

  it('returns pendingResolutions in data', async () => {
    const result = await getDashboardData();
    expect(result.data?.pendingResolutions).toBeGreaterThanOrEqual(0);
  });

  it('returns upcomingMeetings array in data', async () => {
    const result = await getDashboardData();
    expect(Array.isArray(result.data?.upcomingMeetings)).toBe(true);
  });

  it('returns recentActionItems array in data', async () => {
    const result = await getDashboardData();
    expect(Array.isArray(result.data?.recentActionItems)).toBe(true);
  });

  it('handles unauthenticated user', async () => {
    const { createClient } = await import('../lib/supabase/server');
    (createClient as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null } }) },
    });
    const result = await getDashboardData();
    expect(result.error).toBe('Not authenticated');
  });
});
