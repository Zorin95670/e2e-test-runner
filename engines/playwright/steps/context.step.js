const { expect } = require('@playwright/test');
const { Then } = require('../fixtures');
const { convert, render } = require('../../../core/utils');

function lengthOf(value) {
    if (Array.isArray(value)) {
        return value.length;
    }
    if (value !== null && typeof value === 'object') {
        return Object.keys(value).length;
    }
    if (value !== undefined && value !== null && typeof value.length !== 'undefined') {
        return value.length;
    }

    return String(value).length;
}

Then('I expect {string} is {string}', async ({ world }, templatedExpected, templatedValue) => {
    const expected = render(templatedExpected, world);
    const value = render(templatedValue, world);

    expect(value).toBe(expected);
});

Then('I expect {string} is empty', async ({ world }, templatedValue) => {
    const value = render(templatedValue, world);

    expect(value).toHaveLength(0);
});

Then('I expect {string} is not {string}', async ({ world }, templatedExpected, templatedValue) => {
    const expected = render(templatedExpected, world);
    const value = render(templatedValue, world);

    expect(value).not.toBe(expected);
});

Then('I expect {string} is not empty', async ({ world }, templatedValue) => {
    const value = render(templatedValue, world);

    expect(value).not.toHaveLength(0);
});

Then('I expect {string} is {string} as {string}', async ({ world }, templatedExpected, templatedValue, type) => {
    const expected = convert(render(templatedExpected, world), type);
    const value = convert(render(templatedValue, world), type);

    if (type === 'json') {
        expect(value).toEqual(expected);
    } else {
        expect(value).toBe(expected);
    }
});

Then('I expect {string} contains {string}', async ({ world }, templatedExpected, templatedValue) => {
    const expected = render(templatedExpected, world);
    const value = render(templatedValue, world);

    expect(expected).toContain(value);
});

Then('I expect {string} not contains {string}', async ({ world }, templatedExpected, templatedValue) => {
    const expected = render(templatedExpected, world);
    const value = render(templatedValue, world);

    expect(expected).not.toContain(value);
});

Then('I store {string} as {string} in context', async ({ world }, key, templatedValue) => {
    world.ctx[key] = render(templatedValue, world);
});

Then('I store as {string}:', async ({ world }, key, docString) => {
    world.ctx[key] = render(docString, world);
});

Then('I expect {string} to have length {int}', async ({ world }, templatedValue, expectedLength) => {
    const value = render(templatedValue, world);

    expect(value.length).toBe(expectedLength);
});

Then('I expect {string} as {string} to have length {int}', async ({ world }, templatedValue, type, expectedLength) => {
    const value = convert(render(templatedValue, world), type);

    expect(lengthOf(value)).toBe(expectedLength);
});

Then('I expect one resource of {string} equals to {string}', async ({ world }, templatedValue, templatedExpected) => {
    const value = convert(render(templatedValue, world), 'json');
    const expected = render(templatedExpected, world);

    expect(value.some((entry) => entry === expected)).toBe(true);
});

Then('I expect one resource of {string} equals to {string} as {string}', async ({ world }, templatedValue, templatedExpected, type) => {
    const value = convert(render(templatedValue, world), 'json');
    const expected = convert(render(templatedExpected, world), type);

    expect(value.some((entry) => convert(entry, type) === expected)).toBe(true);
});

Then('I expect one resource of {string} contains {string} equals to {string}', async ({ world }, templatedValue, templatedField, templatedExpected) => {
    const value = convert(render(templatedValue, world), 'json');
    const field = render(templatedField, world);
    const expected = render(templatedExpected, world);

    expect(value.some((entry) => entry[field] === expected)).toBe(true);
});

Then('I expect one resource of {string} contains {string} equals to {string} as {string}', async ({ world }, templatedValue, templatedField, templatedExpected, type) => {
    const value = convert(render(templatedValue, world), 'json');
    const field = render(templatedField, world);
    const expected = convert(render(templatedExpected, world), type);

    expect(value.some((entry) => convert(entry[field], type) === expected)).toBe(true);
});

Then('I store the text of the HTML element {string} as {string} in context', async ({ page, world }, templatedSelector, key) => {
    const locator = page.locator(render(templatedSelector, world));

    await locator.first().waitFor({ state: 'attached' });
    world.ctx[key] = (await locator.allTextContents()).join('');
});
