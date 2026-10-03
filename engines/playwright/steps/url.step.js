const { expect } = require('@playwright/test');
const { Given, Then } = require('../fixtures');
const { render } = require('../../../core/utils');

const URL_TIMEOUT = 15000;

Given('I visit the {string}', async ({ page, world }, templatedUrl) => {
    await page.goto(render(templatedUrl, world));
});

Given('I reload to {string}', async ({ page, world }, templatedUrl) => {
    await page.goto(render(templatedUrl, world));
    await page.reload();
});

Then('I expect the current URL no longer is {string}', async ({ page, world }, templatedUrl) => {
    const url = render(templatedUrl, world);

    await expect.poll(() => page.url(), { timeout: URL_TIMEOUT }).not.toBe(url);
});

Then('I expect the current URL no longer contains {string}', async ({ page, world }, templatedUrl) => {
    const url = render(templatedUrl, world);

    await expect.poll(() => page.url(), { timeout: URL_TIMEOUT }).not.toContain(url);
});

Then('I expect the current URL no longer matches {string}', async ({ page, world }, templatedUrl) => {
    const regex = new RegExp(render(templatedUrl, world));

    await expect.poll(() => page.url(), { timeout: URL_TIMEOUT }).not.toMatch(regex);
});

Then('I expect current url is {string}', async ({ page, world }, templatedExpectedUrl) => {
    const expectedUrl = render(templatedExpectedUrl, world);

    await expect.poll(() => page.url()).toBe(expectedUrl);
});

Then('I expect current url contains {string}', async ({ page, world }, templatedExpectedUrl) => {
    const expectedUrl = render(templatedExpectedUrl, world);

    await expect.poll(() => page.url()).toContain(expectedUrl);
});

Then('I expect current url matches {string}', async ({ page, world }, templatedExpectedUrl) => {
    const regex = new RegExp(render(templatedExpectedUrl, world));

    await expect.poll(() => page.url()).toMatch(regex);
});

// Playwright has no same-origin restriction: the origin url is only kept in context for parity with Cypress.
Given('I set origin url as {string}', async ({ world }, templatedUrl) => {
    world.originUrl = render(templatedUrl, world);
});

Given('I reset origin url', async ({ world }) => {
    world.originUrl = null;
});
