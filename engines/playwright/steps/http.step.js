const { expect } = require('@playwright/test');
const { Given, Then, When } = require('../fixtures');
const { getDataTable, render } = require('../../../core/utils');

// Same shape as the Cypress `cy.request` response: JSON bodies are parsed.
async function toResponse(response) {
    const headers = response.headers();
    const text = await response.text();
    let body = text;

    if ((headers['content-type'] || '').includes('json')) {
        try {
            body = JSON.parse(text);
        } catch (e) {
            body = text;
        }
    }

    return {
        status: response.status(),
        statusText: response.statusText(),
        headers,
        body,
    };
}

// `page.request` shares cookies with the browser, like `cy.request`.
async function request(page, world, url, options) {
    const response = await page.request.fetch(url, {
        headers: { ...world.httpHeaders },
        failOnStatusCode: false,
        ...options,
    });

    world.response = await toResponse(response);
}

When('I request {string} with method {string}', async ({ page, world }, templatedUrl, method) => {
    await request(page, world, render(templatedUrl, world), { method });
});

When('I request {string} with method {string} with query parameters', async ({ page, world }, templatedUrl, method, dataTable) => {
    const params = getDataTable(world, dataTable);

    await request(page, world, render(templatedUrl, world), { method, params });
});

When('I request {string} with method {string} with body:', async ({ page, world }, templatedUrl, method, docString) => {
    const data = render(docString, world);

    await request(page, world, render(templatedUrl, world), { method, data });
});

Then('I expect status code is {int}', async ({ world }, expected) => {
    expect(world.response.status).toBe(expected);
});

Given('I set http header {string} with {string}', async ({ world }, key, templatedValue) => {
    world.httpHeaders[key] = render(templatedValue, world);
});

Then('I expect http header {string} is {string}', async ({ world }, headerName, templatedExpected) => {
    const expected = render(templatedExpected, world);

    expect(world.response.headers[headerName.toLowerCase()]).toBe(expected);
});

Then('I expect http header {string} contains {string}', async ({ world }, headerName, templatedExpected) => {
    const expected = render(templatedExpected, world);

    expect(world.response.headers[headerName.toLowerCase()]).toContain(expected);
});
