import { describe, it, expect, vi, beforeEach } from 'vitest';
import { importClientsFromCSV } from '@/lib/actions/clients';

const mockInsert = vi.fn();
const mockGetUser = vi.fn();

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => ({
    auth: { getUser: mockGetUser },
    from: vi.fn(() => ({ insert: mockInsert })),
  })),
}));

// importClientsFromCSV accepts a CSV string (first line = headers, subsequent
// lines = data rows). Both name and email are required; rows missing either
// are filtered out before any insert is attempted.

describe('importClientsFromCSV', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } });
    mockInsert.mockResolvedValue({ error: null });
  });

  it('returns zeros for unauthenticated user', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    const csv = 'name,email\nAcme Corp,billing@acme.com';
    const result = await importClientsFromCSV(csv);
    expect(result).toEqual({ imported: 0, errors: 0 });
  });

  it('imports valid client rows from CSV string', async () => {
    const csv = [
      'name,email,phone,address',
      'Acme Corp,billing@acme.com,+1-555-0100,123 Main St',
      'Beta Inc,accounts@beta.com,+1-555-0200,456 Oak Ave',
    ].join('\n');
    const result = await importClientsFromCSV(csv);
    expect(result.imported).toBe(2);
    expect(result.errors).toBe(0);
  });

  it('skips rows with no name', async () => {
    // The action filters rows where name is falsy before inserting.
    const csv = [
      'name,email',
      ',noname@test.com',
      'Valid Client,valid@test.com',
    ].join('\n');
    const result = await importClientsFromCSV(csv);
    // Only the valid row (name + email present) reaches the insert call.
    expect(result.imported).toBe(1);
    expect(result.errors).toBe(0);
  });

  it('skips rows with no email', async () => {
    const csv = [
      'name,email',
      'No Email Client,',
      'Good Client,good@test.com',
    ].join('\n');
    const result = await importClientsFromCSV(csv);
    expect(result.imported).toBe(1);
    expect(result.errors).toBe(0);
  });

  it('counts insert errors', async () => {
    mockInsert
      .mockResolvedValueOnce({ error: null })
      .mockResolvedValueOnce({ error: { message: 'duplicate email' } });
    const csv = [
      'name,email',
      'Client A,a@test.com',
      'Client B,b@test.com',
    ].join('\n');
    const result = await importClientsFromCSV(csv);
    expect(result.imported).toBe(1);
    expect(result.errors).toBe(1);
  });

  it('returns zeros for CSV with only a header row', async () => {
    const csv = 'name,email';
    const result = await importClientsFromCSV(csv);
    expect(result).toEqual({ imported: 0, errors: 0 });
  });

  it('supports alternative header spellings', async () => {
    const csv = [
      'full name,email address,company name,phone number',
      'Jane Doe,jane@example.com,Acme,555-1234',
    ].join('\n');
    const result = await importClientsFromCSV(csv);
    expect(result.imported).toBe(1);
    expect(result.errors).toBe(0);
  });
});
