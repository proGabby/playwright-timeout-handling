import * as base from "@playwright/test";
import path from "path";
import { chromium } from "@playwright/test"
import dotenv from 'dotenv';

dotenv.config();

// LambdaTest capabilities
const capabilities = {
  browserName: "Chrome", // Browsers allowed: `Chrome`, `MicrosoftEdge`, `pw-chromium`, `pw-firefox` and `pw-webkit`
  browserVersion: "latest",
  "LT:Options": {
    platform: "Windows 11",
    build: "Playwright Time out",
    name: "Playwright Time out",
    user: process.env.LT_USERNAME,
    accessKey: process.env.LT_ACCESS_KEY,    
    network: true,
    video: true,
    console: true,
    tunnel: false,
    tunnelName: "",
    geoLocation: "",
    timezone: "",
    resolution: "1920x1080",
    deviceName: "",
    deviceOrientation: "",
    selenium_version: "4.0.0",
    driver_version: "latest",
    visual: true,
    smartUI: {
      projectName: "Playwright Time out",
      buildName: "Playwright Time out",
    }
  },
};

// Patching the capabilities dynamically according to the project name.
const modifyCapabilities = (configName, testName) => {
  let config = configName.split("@lambdatest")[0];
  let [browserName, browserVersion, platform] = config.split(":");
  capabilities.browserName = browserName
    ? browserName
    : capabilities.browserName;
  capabilities.browserVersion = browserVersion
    ? browserVersion
    : capabilities.browserVersion;
  capabilities["LT:Options"]["platform"] = platform
    ? platform
    : capabilities["LT:Options"]["platform"];
  capabilities["LT:Options"]["name"] = testName;
};

const getErrorMessage = (obj, keys) =>
    keys.reduce(
      (obj, key) => (typeof obj == "object" ? obj[key] : undefined),
      obj
    );
  
  const test = base.test.extend({
    page: async ({ page, playwright }, use, testInfo) => {  
      let browser;
      let ltPage;
      
      try {
        // Configure LambdaTest platform for cross-browser testing
        let fileName = testInfo.file.split(path.sep).pop();
        if (testInfo.project.name.match(/lambdatest/)) {
          modifyCapabilities(
            testInfo.project.name,
            `${testInfo.title} - ${fileName}`
          );
    
          console.log('Connecting to LambdaTest...');
          browser = await chromium.connect({
            wsEndpoint: `wss://cdp.lambdatest.com/playwright?capabilities=${encodeURIComponent(
              JSON.stringify(capabilities)
            )}`,
          });
          console.log('Connected to LambdaTest');
    
          console.log('Creating new page...');
          ltPage = await browser.newPage(testInfo.project.use);
          console.log('New page created');
          
          // Use the page
          await use(ltPage);
          
          // After the test is done
          const testStatus = {
            action: "setTestStatus",
            arguments: {
              status: testInfo.status,
              remark: getErrorMessage(testInfo, ["error", "message"]),
            },
          };
          
          try {
            await ltPage.evaluate(() => {},
            `lambdatest_action: ${JSON.stringify(testStatus)}`);
          } catch (error) {
            console.error('Error setting test status:', error);
          }
        } else {
          // Run tests in local in case of local config provided
          await use(page);
        }
      } catch (error) {
        console.error('Test execution error:', error);
        throw error;
      } finally {
        // Cleanup
        if (ltPage) {
          try {
            await ltPage.close();
          } catch (error) {
            console.error('Error closing page:', error);
          }
        }
        if (browser) {
          try {
            await browser.close();
          } catch (error) {
            console.error('Error closing browser:', error);
          }
        }
      }
    },
  });
  
  export default test; 