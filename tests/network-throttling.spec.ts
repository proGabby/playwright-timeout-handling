import test from '../lambdatest-setup';
import { expect } from '@playwright/test';

test.describe('Network-Dependent Timeout Strategies', () => {
  const ECOMMERCE_URL = 'https://ecommerce-playground.lambdatest.io/';
  
  // Test with standard network conditions
  test.describe('Standard Network Conditions', () => {
    test.beforeEach(async ({ page }) => {
      // Ensure we're using standard network settings
      console.log('Testing under standard network conditions');
    });
    
    test('loads product images with standard timeouts', async ({ page }) => {
      const loadStartTime = Date.now();
      
      await page.goto(ECOMMERCE_URL, { 
        waitUntil: 'domcontentloaded',
        timeout: 30000 
      });
      
      // Wait for product images to load
      const productImages = page.locator('.product-thumb img');
      await expect(productImages.first()).toBeVisible({ timeout: 8000 });
      
      // Verify images have actual content
      const firstImage = productImages.first();
      await expect(firstImage).toHaveAttribute('src', /.+/);
      
      const loadTime = Date.now() - loadStartTime;
      console.log(`Page loaded in ${loadTime}ms under standard conditions`);
      
      // Standard conditions should load quickly
      expect(loadTime).toBeLessThan(10000);
    });
  });
  
  // Test with 2G network simulation
  test.describe('2G Network Conditions', () => {
    test.beforeEach(async ({ page }) => {
      console.log('Testing under 2G network simulation');
      // Network throttling is configured via lambdatest-setup.ts based on NETWORK_TYPE
    });
    
    test('fails with standard timeout under slow network', async ({ page }) => {
      console.log('Demonstrating timeout failure under 2G conditions...');

      // Set up 2G network conditions
      await page.route('**/*', async (route) => {
        // Add artificial delay to simulate 2G
        await new Promise(resolve => setTimeout(resolve, 2000));
        await route.continue();
      });

      // Try to load with insufficient timeout for 2G
      await expect(async () => {
        await page.goto(ECOMMERCE_URL, { 
          waitUntil: 'domcontentloaded',
          timeout: 2000  // Too short for 2G
        });
      }).rejects.toThrow(/Timeout 2000ms exceeded/);
    });
    
    test('succeeds with adjusted timeout for slow network', async ({ page }) => {
      console.log('Testing under 2G network simulation');
      
      // Set up 2G network conditions
      await page.route('**/*', async (route) => {
        // Add artificial delay to simulate 2G
        await new Promise(resolve => setTimeout(resolve, 2000));
        await route.continue();
      });

      const startTime = Date.now();
      
      // Navigate with extended timeout
      await page.goto(ECOMMERCE_URL, {
        waitUntil: 'domcontentloaded',
        timeout: 60000  // Extended timeout for 2G
      });
      
      console.log('Page navigation completed under 2G');
      
      // Wait for product images with patience
      const productImages = page.locator('.product-thumb img');
      await expect(productImages.first()).toBeVisible({ timeout: 30000 });
      
      // Verify image content despite slow loading
      const firstImage = productImages.first();
      await expect(firstImage).toHaveAttribute('src', /.+/);
      
      const totalLoadTime = Date.now() - startTime;
      console.log(`Page loaded in ${totalLoadTime}ms under 2G conditions`);
      
      // 2G loading should take longer but still complete
      expect(totalLoadTime).toBeGreaterThan(2000); // At least our artificial delay
      expect(totalLoadTime).toBeLessThan(60000);
    });
  });
});
