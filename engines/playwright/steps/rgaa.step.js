const { expect } = require('@playwright/test');
const axe = require('axe-core');
const { Then, When } = require('../fixtures');
const { AXE_OPTIONS, formatViolations, violationsAbove } = require('../../../core/rgaa');

When('I run an RGAA accessibility analysis on the current page', async ({ page, world }) => {
    // Evaluated rather than added as a script tag, so it is not blocked by the page Content-Security-Policy.
    await page.evaluate(axe.source);
    const { violations } = await page.evaluate((options) => window.axe.run(document, options), AXE_OPTIONS);

    world.ctx.rgaa = violations;
});

Then('I expect the page to have no accessibility violations', async ({ world }) => {
    expect(world.ctx.rgaa.length, formatViolations(world.ctx.rgaa)).toBe(0);
});

Then('I expect the page to have no accessibility violations above {string}', async ({ world }, impact) => {
    const above = violationsAbove(world.ctx.rgaa, impact);

    expect(above.length, formatViolations(above)).toBe(0);
});

Then('I expect the page to have at most {int} accessibility violations', async ({ world }, max) => {
    expect(world.ctx.rgaa.length, formatViolations(world.ctx.rgaa)).toBeLessThanOrEqual(max);
});
