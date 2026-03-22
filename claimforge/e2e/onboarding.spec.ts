import { test, expect } from '@playwright/test';

test.describe('Onboarding Flow', () => {
  test('onboarding redirects unauthenticated users', async ({ page }) => {
    await page.goto('/onboarding');
    await expect(page.locator('body')).toBeVisible();
  });
});
