import test, { expect } from "@playwright/test";

test('Throws TimeoutException when dynamic content loads too late', async ({ page }) => {
    // Navigate to the dynamic data loading demo page
    await page.goto('https://www.lambdatest.com/selenium-playground/dynamic-data-loading-demo');
    
    // Click the "Get Random User" button
    await page.click('button:has-text("Get Random User")');
    
    // Wait for loading text to appear
    await page.waitForSelector('#loading', { state: 'visible' });
    
    // Expect a timeout when waiting for the user information
    // Using a very short timeout of 1 second to ensure it fails
    await expect(async () => {
        await page.waitForSelector('img[src*="randomuser"]', { timeout: 1000 });
    }).rejects.toThrow('Timeout 1000ms exceeded');
});