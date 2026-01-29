import { test, expect } from '@playwright/test';

test.describe('Trade-X-Pro-Global E2E Tests', () => {
  test('should load the homepage', async ({ page }) => {
    await page.goto('/');

    // Check if the page loads
    await expect(page).toHaveTitle(/TradePro/);

    // Check for main content
    await expect(page.locator('text=Welcome to TradePro')).toBeVisible();
  });

  test('should navigate to login page', async ({ page }) => {
    await page.goto('/');

    // Click login button (adjust selector based on actual UI)
    await page.click('text=Login');

    // Check if we're on the login page
    await expect(page).toHaveURL(/.*login.*/);
  });

  test('should handle 404 pages', async ({ page }) => {
    await page.goto('/nonexistent-page');

    // Check for 404 content
    await expect(page.locator('text=Page not found')).toBeVisible();
  });
});