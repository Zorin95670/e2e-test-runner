// Checks that every engine defines the same Gherkin step expressions,
// and that every step is used at least once in tests/features.
const fs = require('fs');
const path = require('path');
const { CucumberExpression, ParameterTypeRegistry } = require('@cucumber/cucumber-expressions');
const engines = require('../engines');

const ENGINES_DIR = path.resolve(__dirname, '../engines');
const FEATURES_DIR = path.resolve(__dirname, '../tests/features');
const STEP_REGEX = /\b(?:Given|When|Then)\(\s*(['"`])((?:\\.|(?!\1).)*)\1/g;
const FEATURE_STEP_REGEX = /^\s*(?:Given|When|Then|And|But)\s+(.+?)\s*$/;

function getSteps(engine) {
    const stepsDir = path.join(ENGINES_DIR, engine, 'steps');
    const steps = new Set();

    fs.readdirSync(stepsDir)
        .filter((file) => file.endsWith('.step.js'))
        .forEach((file) => {
            const content = fs.readFileSync(path.join(stepsDir, file), 'utf8');

            for (const [, , expression] of content.matchAll(STEP_REGEX)) {
                steps.add(expression);
            }
        });

    return steps;
}

function getFeatureSteps() {
    return fs.readdirSync(FEATURES_DIR)
        .filter((file) => file.endsWith('.feature'))
        .flatMap((file) => fs.readFileSync(path.join(FEATURES_DIR, file), 'utf8').split('\n'))
        .map((line) => line.match(FEATURE_STEP_REGEX))
        .filter(Boolean)
        .map(([, text]) => text);
}

const stepsByEngine = Object.fromEntries(Object.keys(engines).map((engine) => [engine, getSteps(engine)]));
const allSteps = new Set(Object.values(stepsByEngine).flatMap((steps) => [...steps]));
let errorCount = 0;

Object.entries(stepsByEngine).forEach(([engine, steps]) => {
    const missing = [...allSteps].filter((step) => !steps.has(step));

    errorCount += missing.length;
    console.log(`${engine}: ${steps.size}/${allSteps.size} steps`);
    missing.forEach((step) => console.log(`  - missing: ${step}`));
});

const registry = new ParameterTypeRegistry();
const featureSteps = getFeatureSteps();
const untested = [...allSteps].filter((step) => {
    const expression = new CucumberExpression(step, registry);

    return !featureSteps.some((text) => expression.match(text));
});

errorCount += untested.length;
console.log(`tests/features: ${allSteps.size - untested.length}/${allSteps.size} steps tested`);
untested.forEach((step) => console.log(`  - untested: ${step}`));

process.exit(errorCount > 0 ? 1 : 0);
