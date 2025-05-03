# Playwright Timeout Handling & LambdaTest Integration

This repository demonstrates how to handle timeout errors in Playwright tests, with examples for both local and [LambdaTest Cloud Grid](https://www.lambdatest.com?fp_ref=jaydeep88) execution.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Test Scenarios](#test-scenarios)
- [Handling Timeout Errors in Playwright](#handling-timeout-errors-in-playwright)
- [Running Tests Locally](#running-tests-locally)
- [Running Tests on LambdaTest Cloud Grid](#running-tests-on-lambdatest-cloud-grid)
- [Network Throttling for Timeout Scenarios](#network-throttling-for-timeout-scenarios)
- [Project Structure](#project-structure)
- [References](#references)

---

## Prerequisites

- **Node.js**: v20.16.0 or higher
- **npm**: v10.8.2 or higher
- **Playwright**: v1.52.0 or higher (tested on 1.52.0)
- **LambdaTest Account**: [Sign up here](https://www.lambdatest.com?fp_ref=jaydeep88) for cloud grid testing

Install dependencies:
```bash
npm install
```

---

## Environment Setup

Create a `.env` file in the root directory with your LambdaTest credentials:

```
LT_USERNAME=your_lambdatest_username
LT_ACCESS_KEY=your_lambdatest_access_key
```

These credentials are required for running tests on LambdaTest.

---

## Test Scenarios

This project includes the following test scenarios:

- **Timeout Handling**:  
  - Verifies that Playwright throws a `TimeoutException` when dynamic content or progress bars take too long to load.
  - Example: Waiting for a progress bar to complete or for dynamic content to appear, and asserting that a timeout error is thrown if it takes too long.

- **Dynamic Content & Image Interactions**:  
  - Interacts with dynamically-loaded images and content, both under normal and throttled network conditions.
  - Example: Hovering over products and verifying that action dialogs appear.

- **Network Throttling**:  
  - Simulates slow network conditions (e.g., 2G) to test timeout scenarios more realistically, especially on LambdaTest.

---

## Handling Timeout Errors in Playwright

Timeouts are a common source of flakiness in end-to-end tests. Playwright provides robust APIs to handle and assert on timeouts:

```typescript
await expect(async () => {
  await expect(page.locator('.progress-label')).toHaveText('Complete!', { timeout: 1000 });
}).rejects.toThrow('Timeout 1000ms exceeded');
```

- Use explicit timeouts in `waitForSelector`, `toHaveText`, etc.
- Use `rejects.toThrow` to assert that a timeout error is thrown when expected.
- For network throttling, set the capability `networkThrottling` in LambdaTest or use Playwright's CDP API locally.

---

## Running Tests Locally

1. **Configure the project**  
   In `playwright.config.ts`, set up the `projects` array for your local browser:

   ```typescript
   {
      name: 'local-chrome',
      use: { ...devices['Desktop Chrome'] },
    },
    
   ```

2. **Run the tests**  
   ```bash
   npx playwright test
   ```

---

## Running Tests on LambdaTest Cloud Grid

1. **Set up your `.env` file** with your LambdaTest credentials.

2. **Configure the project**  
   In `playwright.config.ts`, set up the `projects` array for LambdaTest:

   ```typescript
   {
     name: "chrome:latest:macOS Sonoma@lambdatest",
   }
   ```

   Or for Windows:

   ```typescript
   {
     name: "chrome:latest:Windows 10@lambdatest",
   }
   ```

3. **Set network throttling (optional, for timeout scenarios):**  
   In your LambdaTest capabilities (see `lambdatest-setup.ts`), add:

   ```json
   "networkThrottling": "Regular 2G"
   ```

   This will simulate a slow network for the test, making timeout scenarios more realistic.

4. **Run the tests**  
   ```bash
   npx playwright test --project="chrome:latest:macOS Sonoma@lambdatest"
   ```

---

## Network Throttling for Timeout Scenarios

To simulate slow network conditions on LambdaTest, set the capability in your test setup:

```javascript
"LT:Options": {
  ...
  "networkThrottling": "Regular 2G",
  ...
}
```

This is especially useful for verifying that your timeout handling works as expected under real-world slow network conditions.

---

## Project Structure

```
.
├── playwright.config.ts
├── lambdatest-setup.ts
├── .env
├── package.json
└── tests/
    ├── progress-bar.spec.ts
    ├── dynamic-content.spec.ts
    ├── product-image-interaction.spec.ts
    └── top-products-hover-throttle.spec.ts
```

---

## References

- [Playwright Timeout Handling](https://playwright.dev/docs/api/class-locator#locator-wait-for)
- [LambdaTest Playwright Capabilities](https://www.lambdatest.com/support/docs/playwright-automation-capabilities/)
- [LambdaTest Network Throttling](https://www.lambdatest.com/support/docs/network-throttling-in-playwright/)
- [LambdaTest Capabilities Generator](https://www.lambdatest.com/capabilities-generator/)

---

**Happy Testing!**  
For any issues, please open an issue.


