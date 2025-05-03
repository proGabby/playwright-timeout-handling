import test from '../lambdatest-setup';
import { expect } from '@playwright/test';

test('Progress bar completes successfully', async ({ page }) => {
    try {
        // Navigate to the page with a more lenient wait strategy
        console.log('Navigating to page...');
        const response = await page.goto('https://www.lambdatest.com/selenium-playground/jquery-download-progress-bar-demo', { 
            waitUntil: 'domcontentloaded', 
            timeout: 60000 
        });
        console.log('Page response status:', response?.status());
        
        // Wait for the page to be interactive
        console.log('Waiting for page to be interactive...');
        await page.waitForLoadState('domcontentloaded');
        
        // Log the page content for debugging
        const content = await page.content();
        console.log('Page content length:', content.length);
        
        // Wait for the download button to be visible and clickable
        console.log('Waiting for download button...');
        await page.waitForSelector('#downloadButton', { 
            state: 'visible',
            timeout: 30000 
        });
        console.log('Download button found');
        
        // Click the download button
        await page.click('#downloadButton');
        console.log('Download button clicked');
      
        // Wait for progress to reach 100% first
        await expect(page.locator('.progress-label')).toHaveText('Complete!', { timeout: 30000 });
    } catch (error) {
        console.error('Test failed:', error);
        // Take a screenshot on failure
        await page.screenshot({ path: 'error-screenshot.png', fullPage: true });
        throw error;
    }
});

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