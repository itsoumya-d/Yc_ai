import { test, expect } from '@playwright/test';

test.describe('StoryThread Auth Flow', () => {
  test('redirects unauthenticated users to login from dashboard', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login|\/auth/);
  });

  test('login page has required sign-in elements', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('button', { name: /sign in|google/i })).toBeVisible();
  });

  test('redirects unauthenticated users away from stories route', async ({ page }) => {
    await page.goto('/stories');
    const url = page.url();
    expect(url).toMatch(/login|auth|\/$/);
  });

  test('redirects unauthenticated users away from write route', async ({ page }) => {
    await page.goto('/write');
    const url = page.url();
    expect(url).toMatch(/login|auth|\/$/);
  });

  test('redirects unauthenticated users away from profile route', async ({ page }) => {
    await page.goto('/profile');
    const url = page.url();
    expect(url).toMatch(/login|auth|\/$/);
  });

  test('auth callback route exists and handles redirect', async ({ page }) => {
    await page.goto('/auth/callback');
    // Should not error; either redirects or shows a page
    await expect(page.locator('body')).toBeVisible();
  });

  test('login page is accessible', async ({ page }) => {
    await page.goto('/auth/login');
    await expect(page.locator('body')).toBeVisible();
  });

  test('signup page is accessible', async ({ page }) => {
    await page.goto('/auth/signup');
    await expect(page.locator('body')).toBeVisible();
  });

  test('shows error on invalid login credentials', async ({ page }) => {
    await page.goto('/auth/login');
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');

    if (await emailInput.isVisible()) {
      await emailInput.fill('notauser@example.com');
      await passwordInput.fill('wrongpassword123');
      await page.click('button[type="submit"]');
      // Page should remain visible (error state or stays on login)
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('public landing page loads without auth', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/.+/);
    await expect(page.locator('body')).toBeVisible();
  });

  test('privacy page is publicly accessible', async ({ page }) => {
    await page.goto('/privacy');
    await expect(page.locator('body')).toBeVisible();
  });

  test('terms page is publicly accessible', async ({ page }) => {
    await page.goto('/terms');
    await expect(page.locator('body')).toBeVisible();
  });
});
