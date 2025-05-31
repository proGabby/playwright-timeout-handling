
import test from '../lambdatest-setup';
import { expect } from '@playwright/test';

// Set global timeout for all tests
// test.setTimeout(200000);

test.describe('Progress Bar Timeout Strategy', () => {
  const PROGRESS_URL = 'https://www.lambdatest.com/selenium-playground/jquery-download-progress-bar-demo';
  
  test.beforeEach(async ({ page }) => {
    try {
      // Navigate with a more reliable wait strategy
      await page.goto(PROGRESS_URL, { 
        waitUntil: 'domcontentloaded',
        timeout: 60000
      });
      
      // Wait for the button with a separate timeout
      await expect(page.locator('#downloadButton')).toBeVisible({ timeout: 30000 });
    } catch (error) {
      console.error('Error in beforeEach:', error.message);
      throw error;
    }
  });

  test('demonstrates timeout failure with insufficient wait time', async ({ page }) => {
    console.log('Testing insufficient timeout scenario...');
    
    await page.click('#downloadButton');
    
    // This intentionally fails to show poor timeout handling
    await expect(async () => {
      await expect(page.locator('.progress-label'))
        .toHaveText('Complete!', { timeout: 1000 });
    }).rejects.toThrow(/Timed out/);
    
    console.log('Timeout failure demonstrated successfully');
  });

  test('handles progress completion with proper timeout strategy', async ({ page }) => {
    const startTime = Date.now();
    
    await page.click('#downloadButton');
    
    // Wait for progress to begin with a reasonable timeout
    await expect(page.locator('#progressbar')).toBeVisible({ timeout: 10000 });
    console.log('Progress bar appeared, waiting for completion...');
    
    // Progressive timeout strategy
    await expect(page.locator('.progress-label'))
      .toHaveText('Complete!', { timeout: 30000 });
    
    const duration = Date.now() - startTime;
    console.log(`Progress completed in ${duration}ms`);
    
    // Verify completion state
    await expect(page.locator('.progress-label')).toHaveText('Complete!');
  });

  test('implements retry mechanism for unreliable progress bars', async ({ page }) => {
    let attempts = 0;
    const maxRetries = 3;
    let success = false;
    
    while (attempts < maxRetries && !success) {
      try {
        attempts++;
        console.log(`Attempt ${attempts} of ${maxRetries}`);
        
        await page.click('#downloadButton');
        
        // Wait with reasonable timeout
        await expect(page.locator('.progress-label'))
          .toHaveText('Complete!', { timeout: 30000 });
          
        success = true;
        console.log('Progress completed successfully');
        
      } catch (error) {
        if (attempts === maxRetries) {
          throw new Error(`Progress bar failed after ${maxRetries} attempts: ${error.message}`);
        }
        
        console.log(`Attempt ${attempts} failed, retrying...`);
        await page.reload({ waitUntil: 'domcontentloaded' });
      }
    }
  });
});
