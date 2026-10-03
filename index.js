const dotenv = require('dotenv');
const path = require('path');
const engines = require('./engines');

dotenv.config();

function getArg(name) {
    const prefix = `--${name}=`;
    const arg = process.argv.find((a) => a === `--${name}` || a.startsWith(prefix));

    if (!arg) {
        return undefined;
    }

    return arg === `--${name}` ? true : arg.slice(prefix.length);
}

const engine = getArg('engine') || process.env.E2E_ENGINE || 'cypress';
const featuresPath = getArg('features') || process.env.E2E_FEATURES_PATH || process.env.CYPRESS_FEATURES_PATH;

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
process.env.CYPRESS_FEATURES_PATH = process.env.E2E_FEATURES_PATH;

engines[engine]({
    ui: getArg('ui') === true,
    baseUrl: getArg('baseUrl'),
    browser: getArg('browser'),
})
    .then((code) => process.exit(code))
    .catch((err) => {
        console.error(err);
        process.exit(1);
    });
