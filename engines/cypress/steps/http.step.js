import {Given, Then, When} from "@badeball/cypress-cucumber-preprocessor";
import {getClientCertificate, getDataTable, render} from "../../../core/utils";

// Sends the request with `cy.request`, or with a task when a client certificate is set for its origin.
function request(context, options) {
    const headers = {...context.httpHeaders};
    const certificate = getClientCertificate(context, options.url);

    if (certificate) {
        const {qs: params, ...rest} = options;

        return cy.task('requestWithClientCertificate', {...rest, params, headers, certificate});
    }

    return cy.request({...options, headers, failOnStatusCode: false});
}

When('I request {string} with method {string}', (templatedUrl, method) => {
    cy.getContext().then((context) => {
        const url = render(templatedUrl, context);

        request(context, {method, url})
            .then((response) => cy.setContext({response}));
    });
});

When('I request {string} with method {string} with query parameters', (templatedUrl, method, dataTable) => {
    cy.getContext().then((context) => {
        const url = render(templatedUrl, context);
        const qs = getDataTable(context, dataTable);

        request(context, {method, url, qs}).then((response) => cy.setContext({response}));
    });
});

When('I request {string} with method {string} with body:', (templatedUrl, method, docString) => {
    cy.getContext().then((context) => {
        const url = render(templatedUrl, context);
        const body = render(docString, context);

        request(context, {method, url, body}).then((response) => cy.setContext({response}));
    });
});

Then('I expect status code is {int}', (expected) => {
    cy.getContext().then((context) => {
        expect(context.response.status).to.equal(expected);
    });
})

Given('I set http header {string} with {string}', (key, templatedValue) => {
    cy.getContext().then((context) => {
        const value = render(templatedValue, context);
        const {httpHeaders} = context;

        httpHeaders[key] = value;

        return cy.setContext({httpHeaders});
    });
})

Given('I set client certificate {string} and key {string} for {string}', (templatedCert, templatedKey, templatedUrl) => {
    cy.getContext().then((context) => {
        const {origin} = new URL(render(templatedUrl, context));
        const certificate = {cert: render(templatedCert, context), key: render(templatedKey, context)};

        return cy.setContext({clientCertificates: {...context.clientCertificates, [origin]: certificate}});
    });
})

Then('I expect http header {string} is {string}', (headerName, templatedExpected) => {
    cy.getContext().then((context) => {
        const expected = render(templatedExpected, context);
        const headerValue = context.response.headers[headerName.toLowerCase()];

        expect(headerValue).to.equal(expected);
    });
})

Then('I expect http header {string} contains {string}', (headerName, templatedExpected) => {
    cy.getContext().then((context) => {
        const expected = render(templatedExpected, context);
        const headerValue = context.response.headers[headerName.toLowerCase()];

        expect(headerValue).to.include(expected);
    });
})
