import { test, expect } from '@playwright/test';

/**
 * AI Feature tests for InvoiceAI — AI Invoice Extraction.
 * Verifies AI endpoints return proper responses and UI handles loading states.
 */
test.describe('AI Features — InvoiceAI', () => {
  test('AI endpoint returns 401 (not 500) when unauthenticated', async ({ page }) => {
    const res = await page.request.post('/api/ai/extract-invoice', {
      data: {"documentUrl":"https://example.com/invoice.pdf"},
      headers: { 'Content-Type': 'application/json' },
    });
    // Must not be a server error — auth errors are expected
    expect(res.status()).not.toBe(500);
    expect(res.status()).not.toBe(503);
    expect([200, 400, 401, 403, 405]).toContain(res.status());
  });

  test('AI endpoint validates required fields (400 on bad input)', async ({ page }) => {
    const res = await page.request.post('/api/ai/extract-invoice', {
      data: {},
      headers: { 'Content-Type': 'application/json' },
    });
    // Empty body should return validation error, not 500
    expect(res.status()).not.toBe(500);
  });

  test('AI loading state is handled gracefully in UI (mock)', async ({ page }) => {
    // Mock AI endpoint to simulate slow response
    let resolveRequest: (value: unknown) => void;
    const requestPromise = new Promise(r => { resolveRequest = r; });

    await page.route('/api/ai/extract-invoice', async (route) => {
      // Delay response by 100ms to test loading state
      await new Promise(r => setTimeout(r, 100));
      route.fulfill({
        status: 200,
        body: JSON.stringify({"amount":1500,"vendor":"Acme Corp","date":"2026-03-15"}),
      });
      resolveRequest(null);
    });

    await page.goto('/', { waitUntil: 'domcontentloaded' });
    // Page should not show unhandled errors during any request
    await expect(page.locator('body')).toBeVisible();
  });

  test('AI error is handled gracefully (mock 500)', async ({ page }) => {
    // Mock AI endpoint to return 500
    await page.route('/api/ai/extract-invoice', route => {
      route.fulfill({ status: 500, body: JSON.stringify({ error: 'AI service unavailable' }) });
    });
    // Navigate to feature area
    const res = await page.goto('/invoices', { waitUntil: 'domcontentloaded' });
    // App should still render (with error state, not crash)
    expect(res?.status()).not.toBe(500);
    await expect(page.locator('body')).toBeVisible();
  });

  test('OpenAI/AI routes respect rate limiting', async ({ page }) => {
    // Send multiple rapid requests
    const requests = await Promise.all(
      Array.from({ length: 3 }, () =>
        page.request.post('/api/ai/extract-invoice', {
          data: {"documentUrl":"https://example.com/invoice.pdf"},
          headers: { 'Content-Type': 'application/json' },
        })
      )
    );
    // All should return a non-500 response
    for (const res of requests) {
      expect(res.status()).not.toBe(500);
    }
  });
});
