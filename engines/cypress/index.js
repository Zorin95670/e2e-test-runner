const cypress = require('cypress');
const path = require('path');

const CONFIG_FILE = path.resolve(__dirname, 'cypress.config.js');

module.exports = async function runCypress({ ui, baseUrl, browser, engineArgs }) {
    // Other arguments are Cypress CLI options (--spec, --env, --config...): unknown ones make Cypress exit with an error.
    const cliOptions = await cypress.cli.parseRunArguments(['cypress', 'run', ...engineArgs]);
    const config = [cliOptions.config, baseUrl && `baseUrl=${baseUrl}`].filter(Boolean).join(',');
    const options = {
        ...cliOptions,
        project: path.resolve(__dirname, '../..'),
        configFile: CONFIG_FILE,
        browser: browser || cliOptions.browser,
        config: config || undefined,
    };

    if (ui) {
        await cypress.open(options);
        return 0;
    }

    const result = await cypress.run(options);

    if (result.status === 'failed') {
        console.error(result.message);
        return 1;
    }

    return result.totalFailed > 0 ? 1 : 0;
};
