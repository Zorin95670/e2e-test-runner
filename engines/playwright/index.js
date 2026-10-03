const { spawnSync } = require('child_process');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '../..');
const CONFIG_FILE = path.resolve(__dirname, 'playwright.config.js');

function run(args) {
    const result = spawnSync('npx', args, {
        cwd: ROOT_DIR,
        stdio: 'inherit',
        shell: process.platform === 'win32',
        env: process.env,
    });

    if (result.error) {
        throw result.error;
    }

    return result.status;
}

module.exports = async function runPlaywright({ ui, baseUrl, browser, engineArgs }) {
    if (baseUrl) {
        process.env.E2E_BASE_URL = baseUrl;
    }

    if (browser) {
        process.env.E2E_BROWSER = browser;
    }

    const generationStatus = run(['bddgen', 'test', '--config', CONFIG_FILE]);

    if (generationStatus !== 0) {
        return generationStatus;
    }

    // Other arguments are Playwright CLI options (--grep, --headed, --retries...).
    return run(['playwright', 'test', '--config', CONFIG_FILE, ...(ui ? ['--ui'] : []), ...engineArgs]);
};
