const cypress = require('cypress');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const path = require('path');

const argv = yargs(hideBin(process.argv)).options({
    features: { type: 'string', demandOption: true, describe: 'Path to feature files.' },
    baseUrl: { type: 'string', demandOption: true, describe: 'URL of your server to test' },
}).argv;

const absolutePath = path.resolve(argv.features);

cypress.run({
    spec: `${absolutePath}/**/*.feature`,
    config: {
        baseUrl: argv.baseUrl,
    }
});
