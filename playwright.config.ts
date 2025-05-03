import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '.env') });

// Check if required environment variables are present
const LT_USERNAME = process.env.LT_USERNAME;
const LT_ACCESS_KEY = process.env.LT_ACCESS_KEY;

// Debug logging
console.log('LambdaTest Configuration:');
console.log('Username:', LT_USERNAME);
console.log('Access Key:', LT_ACCESS_KEY?.substring(0, 5) + '...'); 

if (!LT_USERNAME || !LT_ACCESS_KEY) {
  console.error('Error: LambdaTest credentials not found. Make sure LT_USERNAME and LT_ACCESS_KEY are set in your .env file.');
  process.exit(1);
}

// Common LambdaTest capability builder function
const getLambdaTestConfig = (browserName, browserVersion = 'latest') => {
  const capabilities = {
    browserName,
    browserVersion,
    'LT:Options': {
      username: LT_USERNAME,
      accessKey: LT_ACCESS_KEY,
      platform: 'macOS Ventura',
      name: `Playwright Test - ${browserName}`,
      build: 'Playwright Build',
      // networkThrottling: 'Regular 2G',
      visual: true,
      network: true,
      console: true,
    },
  };

  return {
    connectOptions: {
      wsEndpoint: `wss://cdp.lambdatest.com/playwright?capabilities=${encodeURIComponent(JSON.stringify(capabilities))}`,
    },
  };
};

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  timeout: 5 * 60 * 1000,
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'https://www.lambdatest.com/selenium-playground',
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: "chrome:latest:macOS Sonoma@lambdatest",
    },
    
  ],

});