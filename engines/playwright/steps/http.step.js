const { expect } = require('@playwright/test');
const { Given, Then, When } = require('../fixtures');
const HttpService = require('../../../core/services/http');
const { getClientCertificate, getDataTable, render } = require('../../../core/utils');

const http = new HttpService();

// Same shape as the Cypress `cy.request` response: JSON bodies are parsed.
async function toResponse(response) {
    const headers = response.headers();

    return {
        status: response.status(),
        statusText: response.statusText(),
        headers,
        body: HttpService.parseBody(headers['content-type'], await response.text()),
    };
}

// `page.request` shares cookies with the browser, like `cy.request`. A request to an origin with a client certificate
// is sent by the HttpService, like with the Cypress task.
async function request(page, world, url, options) {
    const certificate = getClientCertificate(world, url);

    if (certificate) {
        const { data: body, ...rest } = options;

        world.response = await http.requestWithClientCertificate({
            ...rest, url, body, headers: { ...world.httpHeaders }, certificate,
        });

        return;
    }

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

Given('I set client certificate {string} and key {string} for {string}', async ({ world }, templatedCert, templatedKey, templatedUrl) => {
    world.clientCertificates[new URL(render(templatedUrl, world)).origin] = {
        cert: render(templatedCert, world),
        key: render(templatedKey, world),
    };
});

Then('I expect http header {string} is {string}', async ({ world }, headerName, templatedExpected) => {
    const expected = render(templatedExpected, world);

    expect(world.response.headers[headerName.toLowerCase()]).toBe(expected);
});

Then('I expect http header {string} contains {string}', async ({ world }, headerName, templatedExpected) => {
    const expected = render(templatedExpected, world);

    expect(world.response.headers[headerName.toLowerCase()]).toContain(expected);
});
