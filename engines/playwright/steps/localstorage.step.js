const { expect } = require('@playwright/test');
const { Given, Then } = require('../fixtures');
const { convert, render } = require('../../../core/utils');

function hasOrigin(page) {
    return page.url() !== 'about:blank';
}

async function getItem(page, key) {
    if (!hasOrigin(page)) {
        return null;
    }

    return page.evaluate((k) => localStorage.getItem(k), key);
}

Given('I set in localstorage field {string} with {string}', async ({ page, world }, key, templatedValue) => {
    const value = render(templatedValue, world);

    if (hasOrigin(page)) {
        await page.evaluate(([k, v]) => localStorage.setItem(k, v), [key, value]);
        return;
    }

    // No page visited yet: the value is set on the first page load only, so the application can still change it.
    await page.context().addInitScript(([k, v]) => {
        const flag = `__e2e_localstorage_${k}`;

        if (!sessionStorage.getItem(flag)) {
            localStorage.setItem(k, v);
            sessionStorage.setItem(flag, 'true');
        }
    }, [key, value]);
});

Then('I expect localstorage field {string} is {string}', async ({ page, world }, key, templatedExpectedValue) => {
    const expectedValue = render(templatedExpectedValue, world);

    expect(await getItem(page, key)).toBe(expectedValue);
});

Then('I delete {string} in localstorage', async ({ page }, key) => {
    if (hasOrigin(page)) {
        await page.evaluate((k) => localStorage.removeItem(k), key);
    }
});

Then('I set localstorage field {string} to context field {string}', async ({ page, world }, localStorageField, contextField) => {
    world.ctx[contextField] = await getItem(page, localStorageField);
});

Then('I set localstorage field {string} to context field {string} as {string}', async ({ page, world }, localStorageField, contextField, type) => {
    world.ctx[contextField] = convert(await getItem(page, localStorageField), type);
});
