import {Given, Then} from "@badeball/cypress-cucumber-preprocessor";
import {convert, render} from "./utils";

Given('I set in localstorage field {string} with {string}', (key, templetedValue) => {
    cy.getContext().then((context) => {
        const value = render(templetedValue, context);

        localStorage.setItem(key, value);
    });
});

Then('I expect localstorage field {string} is {string}', (key, templateExpectedValue) => {
    cy.getContext().then((context) => {
        const expectedValue = render(templateExpectedValue, context);

        expect(expectedValue).to.eq(localStorage.getItem(key));
    });
});

Then('I delete {string} in localstorage', (key) => {
    localStorage.removeItem(key);
});

Then('I set localstorage field {string} to context field {string}', (localStorageField, contextField) => {
    cy.getContext().then((context) => {
       const {ctx} = context;

       ctx[contextField] = localStorage.getItem(localStorageField);

        return cy.setContext({ ctx });
    });
});

Then('I set localstorage field {string} to context field {string} as {string}', (localStorageField, contextField, type) => {
    cy.getContext().then((context) => {
        const {ctx} = context;

        ctx[contextField] = convert(localStorage.getItem(localStorageField), type);

        return cy.setContext({ ctx });
    });
});
