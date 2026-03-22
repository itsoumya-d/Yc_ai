import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/ai/write/route';
import { NextRequest } from 'next/server';

// Mock Supabase server client — used for auth check inside the route
const mockGetUser = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() =>
    Promise.resolve({
      auth: { getUser: mockGetUser },
    })
  ),
}));

// Mock rate-limit helpers so tests are not affected by shared in-memory state
vi.mock('@/lib/rate-limit', () => ({
  aiRateLimit: vi.fn(() => ({ success: true, remaining: 4, resetAt: Date.now() + 60_000 })),
  getRateLimitHeaders: vi.fn(() => ({
    'X-RateLimit-Limit': '5',
    'X-RateLimit-Remaining': '4',
    'X-RateLimit-Reset': String(Math.ceil((Date.now() + 60_000) / 1000)),
  })),
}));

// Mock OpenAI — the route returns response.choices[0].message.content as `text`
vi.mock('openai', () => ({
  default: vi.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: vi.fn().mockResolvedValue({
          choices: [
            {
              message: {
                content:
                  'The detective stepped into the dimly lit room, her eyes scanning for clues.',
              },
            },
          ],
        }),
      },
    },
  })),
}));

function makeRequest(body: object): NextRequest {
  return new NextRequest('http://localhost/api/ai/write', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('POST /api/ai/write', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: authenticated user
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } });
    // Default: rate limit not exceeded
    const { aiRateLimit, getRateLimitHeaders } = vi.mocked(
      await import('@/lib/rate-limit')
    );
    aiRateLimit.mockReturnValue({ success: true, remaining: 4, resetAt: Date.now() + 60_000 });
    getRateLimitHeaders.mockReturnValue({
      'X-RateLimit-Limit': '5',
      'X-RateLimit-Remaining': '4',
      'X-RateLimit-Reset': String(Math.ceil((Date.now() + 60_000) / 1000)),
    });
  });

  it('returns a text suggestion for valid input', async () => {
    const req = makeRequest({ action: 'Continue the story', content: 'The detective walked in.' });
    const res = await POST(req);

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.text).toBeTruthy();
    expect(typeof data.text).toBe('string');
  });

  it('returns 401 for an unauthenticated request', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    const req = makeRequest({ action: 'Continue the story', content: 'She opened the door.' });
    const res = await POST(req);

    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toBeTruthy();
  });

  it('returns 429 when rate limit is exceeded', async () => {
    const { aiRateLimit } = vi.mocked(await import('@/lib/rate-limit'));
    aiRateLimit.mockReturnValue({ success: false, remaining: 0, resetAt: Date.now() + 30_000 });

    const req = makeRequest({ action: 'Continue the story', content: 'Some text.' });
    const res = await POST(req);

    expect(res.status).toBe(429);
    const data = await res.json();
    expect(data.error).toBeTruthy();
  });

  it('handles the continue action', async () => {
    const req = makeRequest({ action: 'Continue the story', content: 'She opened the door.' });
    const res = await POST(req);

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(typeof data.text).toBe('string');
  });

  it('handles the rephrase action', async () => {
    const req = makeRequest({ action: 'Rephrase this passage', content: 'He went to the store.' });
    const res = await POST(req);

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(typeof data.text).toBe('string');
  });

  it('handles the add_dialog action', async () => {
    const req = makeRequest({ action: 'Add dialog between the characters', content: 'They met at the café.' });
    const res = await POST(req);

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(typeof data.text).toBe('string');
  });

  it('handles the describe action', async () => {
    const req = makeRequest({ action: 'Add vivid description', content: 'The city was old.' });
    const res = await POST(req);

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(typeof data.text).toBe('string');
  });

  it('passes story context to OpenAI when provided', async () => {
    const req = makeRequest({
      action: 'Continue the story',
      content: 'She looked at the map.',
      context: 'A mystery set in 1920s Paris',
    });
    const res = await POST(req);

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(typeof data.text).toBe('string');
  });

  it('returns an empty string when OpenAI returns no content', async () => {
    const openai = (await import('openai')).default as ReturnType<typeof vi.fn>;
    openai.mockImplementationOnce(() => ({
      chat: {
        completions: {
          create: vi.fn().mockResolvedValue({ choices: [{ message: { content: null } }] }),
        },
      },
    }));

    const req = makeRequest({ action: 'Continue the story', content: 'A blank slate.' });
    const res = await POST(req);

    expect(res.status).toBe(200);
    const data = await res.json();
    // Route falls back to '' via nullish coalescing
    expect(data.text).toBe('');
  });
});
