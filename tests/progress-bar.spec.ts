import test from '../lambdatest-setup';
import { expect } from '@playwright/test';



test('Throws TimeoutException if progress bar is slow', async ({ page }) => {
    // Navigate to the page
    await page.goto('https://www.lambdatest.com/selenium-playground/jquery-download-progress-bar-demo');
    
    // Click the download button
    await page.click('#downloadButton');
    
    // Try to wait for completion with a very short timeout
    // This should fail because the progress bar takes longer than 1 second to complete
    await expect(async () => {
        await expect(page.locator('.progress-label')).toHaveText('Complete!', { timeout: 1000 });
    }).rejects.toThrow();
});