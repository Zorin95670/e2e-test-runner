// Checks that every engine defines the same Gherkin step expressions.
const fs = require('fs');
const path = require('path');
const engines = require('../engines');

const ENGINES_DIR = path.resolve(__dirname, '../engines');
const STEP_REGEX = /\b(?:Given|When|Then)\(\s*(['"`])((?:\\.|(?!\1).)*)\1/g;

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

const stepsByEngine = Object.fromEntries(Object.keys(engines).map((engine) => [engine, getSteps(engine)]));
const allSteps = new Set(Object.values(stepsByEngine).flatMap((steps) => [...steps]));
let missingCount = 0;

Object.entries(stepsByEngine).forEach(([engine, steps]) => {
    const missing = [...allSteps].filter((step) => !steps.has(step));

    missingCount += missing.length;
    console.log(`${engine}: ${steps.size}/${allSteps.size} steps`);
    missing.forEach((step) => console.log(`  - missing: ${step}`));
});

process.exit(missingCount > 0 ? 1 : 0);
