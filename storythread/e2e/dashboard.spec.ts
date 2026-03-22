import { test, expect } from '@playwright/test';

/**
 * Dashboard navigation tests for StoryThread.
 * Verifies all routes load without 500 errors.
 * Protected routes redirect to login (correct behavior when unauthenticated).
 */
test.describe('Dashboard Navigation — StoryThread', () => {
  // Unauthenticated: protected routes should redirect to login, not 500
  const protectedRoutes = [
    '//dashboard',
    '//stories',
    '//discover',
    '//notifications',
    '//settings',
  ];

  for (const route of protectedRoutes) {
    test(`${route} loads or redirects (no 500)`, async ({ page }) => {
      const response = await page.goto(route, { waitUntil: 'domcontentloaded' });
      // Must not be a server error
      expect(response?.status()).not.toBe(500);
      expect(response?.status()).not.toBe(503);
      // Should either render content or redirect to auth
      const url = page.url();
      const isAuthPage = url.includes('/auth') || url.includes('/login') || url.includes('/signup');
      const isLandingPage = url === 'http://localhost:3000/' || url === 'http://localhost:3000';
      const isTargetPage = url.includes(route.split('/').pop() ?? route);
      expect(isAuthPage || isLandingPage || isTargetPage).toBeTruthy();
    });
  }

  test('dashboard layout has no JavaScript console errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    await page.goto('/dashboard', { waitUntil: 'domcontentloaded' });
    // Filter out known non-actionable errors (e.g. auth redirects cause fetch cancels)
    const actionableErrors = errors.filter(e =>
      !e.includes('NetworkError') &&
      !e.includes('Failed to fetch') &&
      !e.includes('ERR_ABORTED') &&
      !e.includes('cancelled')
    );
    expect(actionableErrors).toHaveLength(0);
  });

  test('navigation links are accessible (ARIA)', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    // All links must have accessible text
    const links = page.locator('nav a');
    const count = await links.count();
    for (let i = 0; i < Math.min(count, 10); i++) {
      const text = await links.nth(i).textContent();
      const ariaLabel = await links.nth(i).getAttribute('aria-label');
      expect(text?.trim() || ariaLabel).toBeTruthy();
    }
  });
});
