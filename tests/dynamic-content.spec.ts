import test from '../lambdatest-setup';
import { expect } from '@playwright/test';

test.describe('Dynamic Content Timeout Strategies', () => {
  const DYNAMIC_URL = 'https://www.lambdatest.com/selenium-playground/dynamic-data-loading-demo';
  
  test.beforeEach(async ({ page }) => {
    await page.goto(DYNAMIC_URL, { 
      waitUntil: 'domcontentloaded',
      timeout: 60000 
    });
  });

  test('fails with insufficient timeout for API-driven content', async ({ page }) => {
    console.log('Testing API content loading with short timeout...');
    
    await page.getByRole('button', { name: 'Get Random User' }).click();
    
    // Verify loading indicator appears
    await expect(page.getByText('Loading...')).toBeVisible();
    
    // This fails intentionally to demonstrate poor timeout handling
    await expect(async () => {
      await page.locator('#loading img')
        .waitFor({ timeout: 200 });
    }).rejects.toThrow(/Timeout 200ms exceeded/);
    
    console.log('Short timeout failure demonstrated');
  });

  test('succeeds with progressive timeout strategy', async ({ page }) => {
    const loadStartTime = Date.now();
    
    await page.getByRole('button', { name: 'Get Random User' }).click();
    
    // Phase 1: Wait for loading state
    await expect(page.getByText('Loading...')).toBeVisible({ timeout: 3000 });
    console.log('Loading indicator appeared');
    
    // Phase 2: Wait for loading to disappear
    await expect(page.getByText('Loading...')).toHaveCount(0, { timeout: 8000 });
    console.log('Loading completed');
    
    // Phase 3: Wait for the image to be present in the DOM first
    const userImage = page.locator('#loading img');
    await userImage.waitFor({ state: 'attached', timeout: 10000 });
    console.log('Image element found in DOM');
    
    // Phase 4: Then verify it's visible
    await expect(userImage).toBeVisible({ timeout: 10000 });
    
    const totalLoadTime = Date.now() - loadStartTime;
    console.log(`Dynamic content loaded in ${totalLoadTime}ms`);
    
    // Validate content quality
    await expect(userImage).toHaveAttribute('src', /.*\.(jpg|png|jpeg)/);
  });

  test('handles multiple dynamic elements with staggered loading', async ({ page }) => {
    await page.getByRole('button', { name: 'Get Random User' }).click();
    
    // Wait for sequential element appearance with correct selectors
    const elementsToLoad = [
      { selector: '#loading img', timeout: 15000, name: 'User image' },
      { selector: '#loading:has-text("First Name")', timeout: 7000, name: 'User first name' },
      { selector: '#loading:has-text("Last Name")', timeout: 7000, name: 'User last name' }
    ];
    
    for (const element of elementsToLoad) {
      console.log(`Waiting for ${element.name}...`);
      
      // First wait for element to be in DOM
      await page.locator(element.selector).waitFor({ state: 'attached', timeout: element.timeout });
      console.log(`${element.name} found in DOM`);
      
      // Then verify it's visible
      await expect(page.locator(element.selector))
        .toBeVisible({ timeout: 5000 });
        
      console.log(`${element.name} loaded successfully`);
    }
  });
});
