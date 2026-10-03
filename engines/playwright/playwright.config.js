const { defineConfig } = require('@playwright/test');
const { defineBddConfig } = require('playwright-bdd');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const ROOT_DIR = path.resolve(__dirname, '../..');
const OUTPUT_DIR = path.join(ROOT_DIR, 'playwright');
const featuresPath = path.resolve(process.env.E2E_FEATURES_PATH);

const BROWSERS = {
    chromium: { browserName: 'chromium' },
    chrome: { browserName: 'chromium', channel: 'chrome' },
    edge: { browserName: 'chromium', channel: 'msedge' },
    firefox: { browserName: 'firefox' },
    webkit: { browserName: 'webkit' },
};
const browser = process.env.E2E_BROWSER || 'chromium';

if (!BROWSERS[browser]) {
    throw new Error(`Unknown browser "${browser}" for playwright. Available browsers: ${Object.keys(BROWSERS).join(', ')}`);
}

const testDir = defineBddConfig({
    features: `${featuresPath}/**/*.feature`,
    featuresRoot: featuresPath,
    steps: [
        path.join(__dirname, 'fixtures.js'),
        path.join(__dirname, 'steps/*.step.js'),
    ],
    outputDir: path.join(OUTPUT_DIR, '.features-gen'),
});

module.exports = defineConfig({
    testDir,
    outputDir: path.join(OUTPUT_DIR, 'test-results'),
    // Scenarios run one after the other, as with Cypress, since they may share external state (database, kafka...).
    fullyParallel: false,
    workers: 1,
    // As with Cypress, a scenario has no global timeout (roundtrip scenarios can be long): only each step is limited.
    timeout: 0,
    reporter: [['list']],
    use: {
        ...BROWSERS[browser],
        baseURL: process.env.E2E_BASE_URL,
        // Without a global timeout, actions and navigations would otherwise wait indefinitely.
        actionTimeout: 10000,
        navigationTimeout: 60000,
        // Like Cypress, accept self-signed / incomplete certificate chains (local test environments).
        ignoreHTTPSErrors: true,
        screenshot: 'only-on-failure',
    },
});
