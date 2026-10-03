const {defineConfig} = require("cypress");
const createBundler = require("@bahmutov/cypress-esbuild-preprocessor");
const addCucumberPreprocessorPlugin =
    require("@badeball/cypress-cucumber-preprocessor").addCucumberPreprocessorPlugin;
const createEsbuildPlugin =
    require("@badeball/cypress-cucumber-preprocessor/esbuild").createEsbuildPlugin;
const dotenv = require("dotenv");
const path = require('path');
const setupTasks = require('./tasks');

dotenv.config();

const absolutePath = path.resolve(process.env.CYPRESS_FEATURES_PATH);
const chromeSecurityEnabled = process.env.CYPRESS_CHROME_SECURITY_ENABLED !== 'false';

module.exports = defineConfig({
    e2e: {
        chromeWebSecurity: chromeSecurityEnabled,
        env: process.env,
        specPattern: `${absolutePath}/**/*.feature`,
        supportFile: 'support/e2e.js',
        reporter: require.resolve('@badeball/cypress-cucumber-preprocessor/pretty-reporter'),
        async setupNodeEvents(on, config) {
            await addCucumberPreprocessorPlugin(on, config);
            on(
                "file:preprocessor",
                createBundler({
                    plugins: [createEsbuildPlugin(config)],
                })
            );

            setupTasks(on);

            return config;
        },
    }
});