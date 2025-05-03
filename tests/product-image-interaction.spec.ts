import { test, expect } from '@playwright/test';

test('Hover on Top Products shows product-action dialog', async ({ page }) => {
  await page.goto('https://ecommerce-playground.lambdatest.io/');

  // Wait for the Top Products heading to be visible
  await expect(page.locator('h3.module-title', { hasText: 'Top Products' })).toBeVisible();

  // Find the Top Products section root by heading, then get the closest .mz-tab-listing
  const topProductsSection = page.locator('h3.module-title', { hasText: 'Top Products' }).locator('xpath=ancestor::div[contains(@class,"entry-section")]');
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

  // Optionally, check for action buttons inside the dialog
  await expect(hoverDialog.locator('button[title="Add to Cart"]')).toBeVisible();
  await expect(hoverDialog.locator('button[title="Add to Wish List"]')).toBeVisible();
  await expect(hoverDialog.locator('button[title="Quick view"]')).toBeVisible();
  await expect(hoverDialog.locator('button[title="Compare this Product"]')).toBeVisible();
});