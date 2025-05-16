import { test, expect } from '@playwright/test';

test.describe('Dynamic Content Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://www.lambdatest.com/selenium-playground/dynamic-data-loading-demo');
  });

  test('should throw timeout when dynamic content loads too late', async ({ page }) => {
    // Click the button using role selector
    await page.getByRole('button', { name: 'Get Random User' }).click();
    
    // Verify loading state
    const loadingIndicator = page.getByText('Loading...');
    await expect(loadingIndicator).toBeVisible();

    // Assert timeout with specific error message
    await expect(async () => {
      await page.getByRole('img', { name: /random user/i }).waitFor({ timeout: 1000 });
    }).rejects.toThrow('Timeout 1000ms exceeded');
  });
  });