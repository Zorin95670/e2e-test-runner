import {Then, When} from "@badeball/cypress-cucumber-preprocessor";
import nunjucks from "nunjucks";
import {convert, getDataTable} from "./utils";

When('I request {string} with method {string}', (templatedUrl, method) => {
    cy.getContext().then((context) => {
        const url = nunjucks.renderString(templatedUrl, context);

        cy.request({
            method,
            url,
            failOnStatusCode: false
        })
            .then((response) => cy.setContext({ response }));
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
            failOnStatusCode: false
        }).then((response) => cy.setContext({ response }));
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
            failOnStatusCode: false
        }).then((response) => cy.setContext({ response }));
    });
});

When('I request {string} with method {string} with body as {string}:', (templatedUrl, method, contentType, docString) => {
    cy.getContext().then((context) => {
        const url = nunjucks.renderString(templatedUrl, context);
        const body = nunjucks.renderString(docString, context);

        cy.request({
            method,
            url,
            body,
            headers: { 'Content-Type': contentType },
            failOnStatusCode: false
        }).then((response) => cy.setContext({ response }));
    });
});

Then('I expect status code is {int}', (expected) => {
    cy.getContext().then((context) => {
        expect(context.response.status).to.equal(expected);
    });
})