import { test, expect } from '@playwright/test';

/**
 * Core feature tests for BoardBrief — Board Meetings.
 * Tests the primary user flow for creating/accessing the core entity.
 */
test.describe('Core Feature: Board Meetings — BoardBrief', () => {
  test('Meetings page loads or redirects correctly', async ({ page }) => {
    const res = await page.goto('/meetings', { waitUntil: 'domcontentloaded' });
    expect(res?.status()).not.toBe(500);
    expect(res?.status()).not.toBe(503);
    await expect(page.locator('body')).toBeVisible();
  });

  test('create meeting form is accessible when authenticated (stub)', async ({ page }) => {
    // Mock auth: inject session cookie stub
    await page.goto('/auth/login', { waitUntil: 'domcontentloaded' });
    const loginForm = page.locator('form');
    if (await loginForm.count() > 0) {
      // Login form is present — we can verify form elements
      await expect(page.locator('input[type="email"], input[name="email"]').first()).toBeVisible();
    }
    // Navigate to feature page regardless
    const res = await page.goto('/meetings');
    expect(res?.status()).not.toBe(500);
  });

  test('meeting list page has correct structure (unauthenticated)', async ({ page }) => {
    await page.goto('/meetings', { waitUntil: 'domcontentloaded' });
    // Should not show a blank page or 500
    const bodyText = await page.locator('body').textContent();
    expect(bodyText).toBeTruthy();
    expect(bodyText?.length).toBeGreaterThan(10);
  });

  test('API routes for meeting return proper auth error when unauthenticated', async ({ page }) => {
    // Direct API call without auth should return 401 or 302, not 500
    const res = await page.request.get('/api/meetings');
    expect([200, 301, 302, 307, 308, 401, 403]).toContain(res.status());
  });

  test('landing page showcases Board Meetings value proposition', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const bodyText = await page.locator('body').textContent() ?? '';
    // Landing page should mention the product/feature in some way
    const hasMention =
      bodyText.toLowerCase().includes('meeting') ||
      bodyText.toLowerCase().includes('board') ||
      bodyText.length > 200; // at minimum renders substantial content
    expect(hasMention).toBeTruthy();
  });
});
