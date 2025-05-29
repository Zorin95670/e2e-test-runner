import {Then, When} from "@badeball/cypress-cucumber-preprocessor";
import {render} from "./utils";

Then('I log {string}', (templatedValue) => {
    cy.getContext().then((context) => {
        const value = render(templatedValue, context);

        cy.task('log', value)
    });
});

When('I wait {int}s', (value) => {
    cy.wait(value * 1000);
});