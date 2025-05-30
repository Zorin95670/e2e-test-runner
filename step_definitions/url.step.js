import {Given, Then} from "@badeball/cypress-cucumber-preprocessor";
import {render} from "./utils";

Given('I visit the {string}', (templatedUrl) => {
    cy.getContext().then((context) => {
        const url = render(templatedUrl, context);

        return cy.visit(url);
    });
});

Given('I reload to {string}', (templatedUrl) => {
    cy.getContext().then((context) => {
        const url = render(templatedUrl, context);

        return cy.visit(url);
    }).then(() => cy.reload(true));
});

Then('I expect the current URL no longer is {string}', (templatedUrl) => {
    cy.getContext().then((context) => {
        const url = render(templatedUrl, context);

        cy.url({ timeout: 15000 }).should('not.eq', url);
    });
});

Then('I expect the current URL no longer contains {string}', (templatedUrl) => {
    cy.getContext().then((context) => {
        const url = render(templatedUrl, context);

        cy.url({ timeout: 15000 }).should('not.contain', url);
    });
});

Then('I expect the current URL no longer matches {string}', (templatedUrl) => {
    cy.getContext().then((context) => {
        const url = render(templatedUrl, context);

        cy.url({ timeout: 15000 }).should('not.match', url);
    });
});

Then('I expect current url is {string}', (templatedExpectedUrl) => {
    cy.getContext().then((context) => {
        const expectedUrl = render(templatedExpectedUrl, context);

        cy.url().should('eq', expectedUrl);
    });
});

Then('I expect current url contains {string}', (templatedExpectedUrl) => {
    cy.getContext().then((context) => {
        const expectedUrl = render(templatedExpectedUrl, context);

        cy.url().should('contain', expectedUrl);
    });
});

Then('I expect current url matches {string}', (templatedExpectedUrl) => {
    cy.getContext().then((context) => {
        const expectedUrl = render(templatedExpectedUrl, context);

        cy.url().should('match', new RegExp(expectedUrl));
    });
});
