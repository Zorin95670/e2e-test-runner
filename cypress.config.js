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

const absolutePath = path.resolve(process.env.E2E_FEATURES_PATH || process.env.CYPRESS_FEATURES_PATH);

module.exports = defineConfig({
    e2e: {
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