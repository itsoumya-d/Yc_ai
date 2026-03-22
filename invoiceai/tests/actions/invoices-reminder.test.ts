import { describe, it, expect, vi, beforeEach } from 'vitest';
import { toggleAutoRemind } from '@/lib/actions/invoices';

// toggleAutoRemind does not call auth.getUser — it directly updates the
// invoices table and returns { error: error?.message }.
// Chain: supabase.from('invoices').update({...}).eq('id', invoiceId)
// The terminal .eq() call must be awaitable and resolve to { error }.

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));

const mockEqTerminal = vi.fn();

const makeUpdateChain = () => ({
  update: vi.fn(() => ({ eq: mockEqTerminal })),
});

const mockFrom = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-1' } } }),
    },
    from: mockFrom,
  })),
}));

describe('toggleAutoRemind', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFrom.mockReturnValue(makeUpdateChain());
    mockEqTerminal.mockResolvedValue({ error: null });
  });

  it('enables auto-remind and returns no error', async () => {
    const result = await toggleAutoRemind('invoice-1', true);
    expect(result.error).toBeUndefined();
  });

  it('disables auto-remind and returns no error', async () => {
    const result = await toggleAutoRemind('invoice-1', false);
    expect(result.error).toBeUndefined();
  });

  it('returns the DB error message when update fails', async () => {
    mockEqTerminal.mockResolvedValue({ error: { message: 'row not found' } });
    const result = await toggleAutoRemind('invoice-bad', true);
    expect(result.error).toBe('row not found');
  });

  it('calls from() with the invoices table', async () => {
    await toggleAutoRemind('invoice-1', true);
    expect(mockFrom).toHaveBeenCalledWith('invoices');
  });
});
