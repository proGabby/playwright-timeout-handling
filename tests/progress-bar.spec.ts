import test from '../lambdatest-setup';
import { expect } from '@playwright/test';

test.describe('Progress Bar Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the page before each test
    await page.goto('https://www.lambdatest.com/selenium-playground/jquery-download-progress-bar-demo');
  });

  test('should throw timeout when progress bar is slow', async ({ page }) => {
    // Click the download button using ID selector (as in original test)
    await page.click('#downloadButton');
    
    // Try to wait for completion with a very short timeout
    // This should fail because the progress bar takes longer than 1 second to complete
    await expect(async () => {
      await expect(page.locator('.progress-label')).toHaveText('Complete!', { timeout: 1000 });
    }).rejects.toThrow();
  });
});