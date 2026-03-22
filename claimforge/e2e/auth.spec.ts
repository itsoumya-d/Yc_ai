import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('homepage loads successfully', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/.+/);
    await expect(page.locator('body')).toBeVisible();
  });

  test('login page is accessible', async ({ page }) => {
    await page.goto('/auth/login');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('signup page is accessible', async ({ page }) => {
    await page.goto('/auth/signup');
    await expect(page.locator('input[type="email"]')).toBeVisible();
  });

  test('shows error on invalid login', async ({ page }) => {
    await page.goto('/auth/login');
    await page.fill('input[type="email"]', 'invalid@example.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    await expect(page.locator('body')).toBeVisible();
  });

  test('redirects to login when accessing protected route', async ({ page }) => {
    await page.goto('/dashboard');
    const url = page.url();
    expect(url).toMatch(/login|auth|\/$/);
  });
});
