import {Given, Then, When} from "@badeball/cypress-cucumber-preprocessor";
import nunjucks from "nunjucks";
import {getDataTable, render} from "./utils";

When('I request {string} with method {string}', (templatedUrl, method) => {
    cy.getContext().then((context) => {
        const url = nunjucks.renderString(templatedUrl, context);

        cy.request({
            method,
            url,
            headers: {...context.httpHeaders},
            failOnStatusCode: false
        })
            .then((response) => cy.setContext({response}));
    });
});

When('I request {string} with method {string} with query parameters', (templatedUrl, method, dataTable) => {
    cy.getContext().then((context) => {
        const url = nunjucks.renderString(templatedUrl, context);
        const qs = getDataTable(context, dataTable);

        cy.request({
            method,
            url,
            qs,
            headers: {...context.httpHeaders},
            failOnStatusCode: false
        }).then((response) => cy.setContext({response}));
    });
});

When('I request {string} with method {string} with body:', (templatedUrl, method, docString) => {
    cy.getContext().then((context) => {
        const url = nunjucks.renderString(templatedUrl, context);
        const body = nunjucks.renderString(docString, context);

        cy.request({
            method,
            url,
            body,
            headers: {...context.httpHeaders},
            failOnStatusCode: false
        }).then((response) => cy.setContext({response}));
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
