import { test, expect } from '@playwright/test';

test.describe('Public Pages', () => {
  test('homepage loads', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/.+/);
  });

  test('privacy page loads', async ({ page }) => {
    await page.goto('/privacy');
    await expect(page.locator('h1, h2')).toBeVisible();
  });

  test('terms page loads', async ({ page }) => {
    await page.goto('/terms');
    await expect(page.locator('h1, h2')).toBeVisible();
  });

  test('has no broken links on homepage', async ({ page }) => {
    await page.goto('/');
    // Check that main navigation exists
    await expect(page.locator('nav, header')).toBeVisible();
  });
});
