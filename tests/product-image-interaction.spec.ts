import { test, expect } from '@playwright/test';

test.describe('Product Image Hover Dialog', () => {
  test.beforeEach(async ({ page }) => {
  await page.goto('https://ecommerce-playground.lambdatest.io/');
  });

  test('should show product-action dialog on hover in Top Products', async ({ page }) => {
    // Wait for the Top Products heading to be visible
    const topProductsHeading = page.getByRole('heading', { name: 'Top Products' });
    await expect(topProductsHeading).toBeVisible();

    // Find the Top Products section root by heading, then get the closest .mz-tab-listing
    const topProductsSection = topProductsHeading.locator('xpath=ancestor::div[contains(@class,"entry-section")]');
    const swiper = topProductsSection.locator('.mz-tab-listing .swiper-wrapper');
    await expect(swiper).toBeVisible();

    // Get all product cards in the Top Products carousel
    const productCards = swiper.locator('.product-thumb.image-top');
    const count = await productCards.count();
    expect(count).toBeGreaterThan(1);

    // Hover over the second product (index 1)
    const secondProduct = productCards.nth(1);
    await secondProduct.hover();

    // Wait for the hover dialog to appear
    const hoverDialog = secondProduct.locator('.product-action');
    await expect(hoverDialog).toBeVisible();

    // Check for action buttons inside the dialog
    const actionButtons = [
      { title: 'Add to Cart' },
      { title: 'Add to Wish List' },
      { title: 'Quick view' },
      { title: 'Compare this Product' }
    ];

    for (const { title } of actionButtons) {
      await expect(hoverDialog.locator(`button[title="${title}"]`)).toBeVisible();
    }
  });
});