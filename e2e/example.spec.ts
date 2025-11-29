import { test, expect, type Page } from '@playwright/test';

test('homepage loads and shows app title', async ({ page }: { page: Page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/TradeX Pro/i);
  // Check main container exists
  const el = await page.locator('body');
  await expect(el).toBeVisible();
});

test('optimized images load correctly', async ({ page }: { page: Page }) => {
  await page.goto('/');
  
  // Check if picture element exists (WebP optimization)
  const pictureElement = page.locator('picture source[type="image/webp"]');
  await expect(pictureElement).toBeVisible();
  
  // Check if fallback image loads
  const imgElement = page.locator('img[alt="Professional trading desk"]');
  await expect(imgElement).toBeVisible();
});
