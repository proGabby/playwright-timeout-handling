import { test, expect } from '@playwright/test';

test.describe('Network Throttling Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://www.lambdatest.com/selenium-playground/dynamic-data-loading-demo');
  });

  test('should timeout when dynamic content loads too late with 2G network', async ({ page }) => {
    // Click the button to load random user
    await page.getByRole('button', { name: 'Get Random User' }).click();
    
    // Verify loading state
    const loadingIndicator = page.getByText('Loading...');
    await expect(loadingIndicator).toBeVisible();

    // Assert timeout with specific error message
    await expect(async () => {
      await page.getByRole('img', { name: /random user/i }).waitFor({ timeout: 2000 });
    }).rejects.toThrow('Timeout 2000ms exceeded');
  });
}); 