const { Then, When } = require('../fixtures');
const { render } = require('../../../core/utils');

Then('I log {string}', async ({ world }, templatedValue) => {
    console.log(render(templatedValue, world));
});

When('I wait {int}s', async ({ page }, value) => {
    await page.waitForTimeout(value * 1000);
});
