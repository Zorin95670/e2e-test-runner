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

const absolutePath = path.resolve(process.env.E2E_FEATURES_PATH);

module.exports = defineConfig({
    e2e: {
        expose: process.env,
        specPattern: `${absolutePath}/**/*.feature`,
        supportFile: 'engines/cypress/support/e2e.js',
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