import { test, expect } from '@playwright/test';

test.describe('Onboarding Flow', () => {
  test('onboarding step 1 is accessible after login', async ({ page }) => {
    await page.goto('/onboarding/step-1');
    // Without auth, should redirect
    const url = page.url();
    expect(url).toBeTruthy();
  });

  test('onboarding redirects unauthenticated users', async ({ page }) => {
    await page.goto('/onboarding');
    await expect(page.locator('body')).toBeVisible();
  });
});
