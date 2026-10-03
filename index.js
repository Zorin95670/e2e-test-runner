const dotenv = require('dotenv');
const path = require('path');
const engines = require('./engines');

dotenv.config();

const RUNNER_OPTIONS = ['engine', 'features', 'ui', 'baseUrl', 'browser'];

// Runner options are given as `--name=value` (or `--name` for flags), every other argument is passed to the engine.
function parseArgs(args) {
    const options = {};
    const engineArgs = [];

    args.forEach((arg) => {
        const [, name, value] = arg.match(/^--([^=]+)(?:=(.*))?$/) || [];

        if (RUNNER_OPTIONS.includes(name)) {
            options[name] = value === undefined ? true : value;
        } else {
            engineArgs.push(arg);
        }
    });

    return { options, engineArgs };
}

const { options, engineArgs } = parseArgs(process.argv.slice(2));
const engine = options.engine || process.env.E2E_ENGINE || 'cypress';
const featuresPath = options.features || process.env.E2E_FEATURES_PATH;

if (!engines[engine]) {
    console.error(`Unknown engine "${engine}". Available engines: ${Object.keys(engines).join(', ')}`);
    process.exit(2);
}

if (!featuresPath) {
    console.error('Missing features path: use --features=<path> or set E2E_FEATURES_PATH');
    process.exit(2);
}

// Resolved against the caller's cwd, then shared with engine configs through the environment.
process.env.E2E_FEATURES_PATH = path.resolve(featuresPath);

engines[engine]({
    ui: options.ui === true,
    baseUrl: options.baseUrl || process.env.E2E_BASE_URL,
    browser: options.browser,
    engineArgs,
})
    .then((code) => process.exit(code))
    .catch((err) => {
        console.error(err);
        process.exit(1);
    });
