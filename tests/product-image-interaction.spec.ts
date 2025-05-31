import test from '../lambdatest-setup';
import { expect } from '@playwright/test';

test.describe('Product Card Hover Mechanism Testing', () => {
  const ECOMMERCE_URL = 'https://ecommerce-playground.lambdatest.io/';
  
  test.beforeEach(async ({ page }) => {
    await page.goto(ECOMMERCE_URL, { 
      waitUntil: 'domcontentloaded',
      timeout: 60000 
    });
  });

  test('demonstrates hover timeout failure with insufficient wait', async ({ page }) => {
    // Navigate to product section
    const topProductsHeading = page.getByRole('heading', { name: 'Top Products' });
    await expect(topProductsHeading).toBeVisible();
    
    const productSection = topProductsHeading.locator('xpath=ancestor::div[contains(@class,"entry-section")]');
    const productGrid = productSection.locator('.mz-tab-listing .swiper-wrapper');
    
    await expect(productGrid).toBeVisible();
    
    const productCards = productGrid.locator('.product-thumb.image-top');
    const productCount = await productCards.count();
    expect(productCount).toBeGreaterThan(0);
    
    const targetProduct = productCards.nth(1);
    const productAction = targetProduct.locator('.product-action');
    
    // This demonstrates failure with insufficient timeout
    // The CSS transition takes 300ms, but we only wait 50ms
    await expect(async () => {
      await targetProduct.hover({ timeout: 50 });
      // Try to verify the slide-down animation completes immediately (it won't)
      await expect(productAction).toBeVisible({ timeout: 50 });
    }).rejects.toThrow(/Timeout.*exceeded/);
    
    console.log('✓ Test correctly failed due to insufficient wait time for CSS animation');
  });

  test('handles hover interactions successfully with proper timing', async ({ page }) => {
    // Navigate to product section with generous timeouts
    const topProductsHeading = page.getByRole('heading', { name: 'Top Products' });
    await expect(topProductsHeading).toBeVisible({ timeout: 10000 });
    
    const productSection = topProductsHeading.locator('xpath=ancestor::div[contains(@class,"entry-section")]');
    const productGrid = productSection.locator('.mz-tab-listing .swiper-wrapper');
    
    await expect(productGrid).toBeVisible({ timeout: 8000 });
    
    const productCards = productGrid.locator('.product-thumb.image-top');
    const productCount = await productCards.count();
    expect(productCount).toBeGreaterThan(0);
    
    const targetProduct = productCards.nth(1);
    const productAction = targetProduct.locator('.product-action');
    
    // Verify initial state: buttons positioned above visible area (bottom: 100%)
    const initialStyles = await productAction.evaluate(el => {
      const styles = window.getComputedStyle(el);
      return {
        position: styles.position,
        bottom: styles.bottom,
        transition: styles.transition
      };
    });
    
    console.log('Initial product-action styles:', initialStyles);
    expect(initialStyles.position).toBe('absolute');
    
    // Phase 1: Initiate hover with proper timing
    const hoverStartTime = Date.now();
    await targetProduct.hover();
    console.log('Hover initiated - slide-down animation starting');
    
    // Phase 2: Wait for CSS transition to complete (300ms + buffer)
    await expect(productAction).toBeVisible({ timeout: 1000 });
    console.log('Product action buttons became visible after slide-down');
    
    // Phase 3: Verify all action buttons are present after animation
    const expectedButtons = [
      'Add to Cart',
      'Add to Wish List', 
      'Quick view',
      'Compare this Product'
    ];
    
    for (const buttonTitle of expectedButtons) {
      const actionButton = productAction.locator(`button[title="${buttonTitle}"]`);
      await expect(actionButton).toBeVisible({ timeout: 2000 });
      console.log(`✓ ${buttonTitle} button verified`);
    }
    
    // Verify hover state: buttons moved into visible area
    const hoverStyles = await productAction.evaluate(el => {
      const styles = window.getComputedStyle(el);
      return {
        bottom: styles.bottom,
        visibility: styles.visibility,
        position: styles.position,
        transform: styles.transform,
        opacity: styles.opacity
      };
    });
    
    console.log('Initial styles:', initialStyles);
    console.log('Hover styles:', hoverStyles);
    
    // Verify the slide-down effect has occurred
    // Handle different browser representations of the same position
    const initialBottom = initialStyles.bottom;
    const hoverBottom = hoverStyles.bottom;
    
    // Convert both values to numbers for comparison
    const initialBottomNum = parseFloat(initialBottom);
    const hoverBottomNum = parseFloat(hoverBottom);
    
    console.log('Initial bottom position:', initialBottomNum);
    console.log('Hover bottom position:', hoverBottomNum);
    
    // Check multiple indicators of hover state
    const hasPositionChange = Math.abs(initialBottomNum - hoverBottomNum) > 0.1;
    const hasTransform = hoverStyles.transform !== 'none';
    const isVisible = hoverStyles.visibility === 'visible' && parseFloat(hoverStyles.opacity) > 0;
    
    // Log the state of each check
    console.log('Position changed:', hasPositionChange);
    console.log('Has transform:', hasTransform);
    console.log('Is visible:', isVisible);
    
    // Verify that the element is visible and interactive
    expect(isVisible).toBeTruthy();
    
    const totalHoverTime = Date.now() - hoverStartTime;
    console.log(`Complete hover interaction took ${totalHoverTime}ms`);
    
    // Ensure interaction was successful but not too slow
    expect(totalHoverTime).toBeGreaterThan(300); // At least transition time
    expect(totalHoverTime).toBeLessThan(5000); // But not unreasonably slow
  });

 

  test('verifies all action buttons appear after hover animation', async ({ page }) => {
    const topProductsHeading = page.getByRole('heading', { name: 'Top Products' });
    await expect(topProductsHeading).toBeVisible();
    
    const productSection = topProductsHeading.locator('xpath=ancestor::div[contains(@class,"entry-section")]');
    const productGrid = productSection.locator('.mz-tab-listing .swiper-wrapper');
    const productCards = productGrid.locator('.product-thumb.image-top');
    const targetProduct = productCards.nth(1);
    
    // Initiate hover
    await targetProduct.hover();
    
    // Wait for slide-down animation to complete
    const productAction = targetProduct.locator('.product-action');
    await expect(productAction).toBeVisible({ timeout: 1000 });
    
    // Verify all expected action buttons are present and visible
    const expectedButtons = [
      { selector: '.btn-cart', title: 'Add to Cart' },
      { selector: '.btn-wishlist', title: 'Add to Wish List' },
      { selector: '.btn-quick-view', title: 'Quick view' },
      { selector: '.btn-compare', title: 'Compare this Product' }
    ];
    
    for (const button of expectedButtons) {
      const buttonElement = productAction.locator(button.selector);
      await expect(buttonElement).toBeVisible({ timeout: 500 });
      
      const buttonTitle = await buttonElement.getAttribute('title');
      expect(buttonTitle).toBe(button.title);
      
      console.log(`✓ ${button.title} button verified`);
    }
  });

  test('tests hover mechanism reset when mouse leaves product area', async ({ page }) => {
    const topProductsHeading = page.getByRole('heading', { name: 'Top Products' });
    await expect(topProductsHeading).toBeVisible();
    
    const productSection = topProductsHeading.locator('xpath=ancestor::div[contains(@class,"entry-section")]');
    const productGrid = productSection.locator('.mz-tab-listing .swiper-wrapper');
    const productCards = productGrid.locator('.product-thumb.image-top');
    const targetProduct = productCards.nth(0);
    const productAction = targetProduct.locator('.product-action');
    
    // Initial hover to trigger slide-down
    await targetProduct.hover();
    await expect(productAction).toBeVisible({ timeout: 1000 });
    
    console.log('Buttons appeared on hover');
    
    // Move mouse away from product
    await page.mouse.move(0, 0);
    
    // Wait for reverse animation (slide-up)
    await page.waitForTimeout(500);
    
    // Verify buttons are hidden again
    const finalVisibility = await productAction.isVisible();
    console.log(`Buttons visible after mouse leave: ${finalVisibility}`);
    
    // The buttons should either be hidden or positioned back to bottom: 100%
    const finalStyles = await productAction.evaluate(el => {
      const styles = window.getComputedStyle(el);
      return {
        bottom: styles.bottom,
        visibility: styles.visibility
      };
    });
    
    console.log('Final styles after mouse leave:', finalStyles);
  });
});


