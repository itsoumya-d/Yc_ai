import { describe, it, expect, vi, beforeEach } from 'vitest';
import { sendDripEmail } from '@/lib/actions/transactional-emails';

// ── Email utility mock ────────────────────────────────────────────────────────
// sendDripEmail calls sendEmail() from @/lib/email (not @sendgrid/mail directly).
// sendEmail uses fetch internally but we mock the module to keep tests fast and
// deterministic without any HTTP calls.
const mockSendEmail = vi.fn().mockResolvedValue({ ok: true });

vi.mock('@/lib/email', () => ({
  sendEmail: mockSendEmail,
  baseTemplate: vi.fn(({ preheader, content }: { brandName: string; brandColor: string; preheader: string; content: string }) =>
    `<html>${preheader}${content}</html>`
  ),
}));

// ── Tests ─────────────────────────────────────────────────────────────────────
describe('sendDripEmail — PetOS', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSendEmail.mockResolvedValue({ ok: true });
  });

  // ── Resolves without throwing ────────────────────────────────────────────
  it('sends day1 welcome email without throwing', async () => {
    await expect(sendDripEmail('alice@test.com', 'Alice', 'day1')).resolves.toBeUndefined();
    expect(mockSendEmail).toHaveBeenCalledOnce();
  });

  it('sends day3 tip email without throwing', async () => {
    await expect(sendDripEmail('bob@test.com', 'Bob', 'day3')).resolves.toBeUndefined();
    expect(mockSendEmail).toHaveBeenCalledOnce();
  });

  it('sends day7 check-in email without throwing', async () => {
    await expect(sendDripEmail('charlie@test.com', 'Charlie', 'day7')).resolves.toBeUndefined();
    expect(mockSendEmail).toHaveBeenCalledOnce();
  });

  it('sends day14 upgrade email without throwing', async () => {
    await expect(sendDripEmail('diana@test.com', 'Diana', 'day14')).resolves.toBeUndefined();
    expect(mockSendEmail).toHaveBeenCalledOnce();
  });

  // ── sendEmail called with correct recipient ──────────────────────────────
  it('passes the correct "to" address to sendEmail', async () => {
    await sendDripEmail('petowner@example.com', 'Owner', 'day1');
    const callArgs = mockSendEmail.mock.calls[0][0];
    expect(callArgs.to).toBe('petowner@example.com');
  });

  it('passes the correct "to" address for day14', async () => {
    await sendDripEmail('upgrade@example.com', 'UpgradeUser', 'day14');
    const callArgs = mockSendEmail.mock.calls[0][0];
    expect(callArgs.to).toBe('upgrade@example.com');
  });

  // ── Subject line contains app-relevant keywords ──────────────────────────
  it('day1 subject contains "Petos"', async () => {
    await sendDripEmail('user@test.com', 'User', 'day1');
    const { subject } = mockSendEmail.mock.calls[0][0];
    expect(subject).toContain('Petos');
  });

  it('day3 subject references a vaccination tip', async () => {
    await sendDripEmail('user@test.com', 'User', 'day3');
    const { subject } = mockSendEmail.mock.calls[0][0];
    // day3 tip subject contains "Petos tip"
    expect(subject).toContain('Petos tip');
  });

  it('day14 subject includes the recipient name', async () => {
    await sendDripEmail('user@test.com', 'Fiona', 'day14');
    const { subject } = mockSendEmail.mock.calls[0][0];
    expect(subject).toContain('Fiona');
  });

  // ── HTML content contains personalisation ───────────────────────────────
  it('day1 html contains the recipient name', async () => {
    await sendDripEmail('user@test.com', 'George', 'day1');
    const { html } = mockSendEmail.mock.calls[0][0];
    expect(html).toContain('George');
  });

  it('day7 html contains the recipient name', async () => {
    await sendDripEmail('user@test.com', 'Harriet', 'day7');
    const { html } = mockSendEmail.mock.calls[0][0];
    expect(html).toContain('Harriet');
  });

  // ── PetOS-specific content checks ────────────────────────────────────────
  it('day1 html contains "Petos" branding', async () => {
    await sendDripEmail('user@test.com', 'Ian', 'day1');
    const { html } = mockSendEmail.mock.calls[0][0];
    expect(html).toContain('Petos');
  });

  it('day3 html mentions vaccination feature', async () => {
    await sendDripEmail('user@test.com', 'Julia', 'day3');
    const { html } = mockSendEmail.mock.calls[0][0];
    // day3 body mentions "vaccination" as the key feature highlight
    expect(html.toLowerCase()).toContain('vaccination');
  });

  // ── sendEmail called exactly once per invocation ─────────────────────────
  it('calls sendEmail exactly once per drip send', async () => {
    await sendDripEmail('user@test.com', 'Ken', 'day7');
    expect(mockSendEmail).toHaveBeenCalledTimes(1);
  });

  // ── Empty email address — function still calls through (guard is in sendEmail) ──
  it('still calls sendEmail even when "to" is empty (guard lives in sendEmail)', async () => {
    await expect(sendDripEmail('', 'NoEmail', 'day1')).resolves.toBeUndefined();
    expect(mockSendEmail).toHaveBeenCalledOnce();
    expect(mockSendEmail.mock.calls[0][0].to).toBe('');
  });

  // ── All four steps produce distinct subjects ─────────────────────────────
  it('each step produces a distinct email subject', async () => {
    const steps = ['day1', 'day3', 'day7', 'day14'] as const;
    const subjects: string[] = [];

    for (const step of steps) {
      vi.clearAllMocks();
      await sendDripEmail('u@test.com', 'Luna', step);
      subjects.push(mockSendEmail.mock.calls[0][0].subject);
    }

    const uniqueSubjects = new Set(subjects);
    expect(uniqueSubjects.size).toBe(4);
  });

  // ── Return type is void ───────────────────────────────────────────────────
  it('returns undefined (void) for all steps', async () => {
    for (const step of ['day1', 'day3', 'day7', 'day14'] as const) {
      vi.clearAllMocks();
      const result = await sendDripEmail('user@test.com', 'Max', step);
      expect(result).toBeUndefined();
    }
  });
});
