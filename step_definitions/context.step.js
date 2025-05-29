import {After, Before, Then} from "@badeball/cypress-cucumber-preprocessor";
import {convert, render} from "./utils";

Before(() => {
    cy.resetContext();
});

After(() => {
    cy.resetContext();
});

Then('I expect {string} is {string}', (templatedExpected, templatedValue) => {
    cy.getContext().then((context) => {
        const expected = render(templatedExpected, context);
        const value = render(templatedValue, context);

        expect(value).to.equal(expected);
    });
});

Then('I expect {string} is {string} as {string}', (templatedExpected, templatedValue, type) => {
    cy.getContext().then((context) => {
        const expected = convert(render(templatedExpected, context), type);
        const value = convert(render(templatedValue, context), type);

        expect(value).to.equal(expected);
    });
});

Then('I store "{string}" as "{string}" in context', (key, templatedValue) => {
    cy.getContext().then((context) => {
        const value = render(templatedValue, context);
        const { ctx } = context;

        ctx[key] = value;

        return cy.setContext({ ctx });
    });
});

Then('I expect {string} to have length {int}', (templatedValue, expectedLength) => {
    cy.getContext().then((context) => {
        const value = render(templatedValue, context);

        expect(value.length).to.equal(expectedLength);
    });
});

Then('I expect {string} as {string} to have length {int}', (templatedValue, type, expectedLength) => {
    cy.getContext().then((context) => {
        const value = convert(render(templatedValue, context), type);

        expect(value.length).to.equal(expectedLength);
    });
});

Then('I expect one resource of {string} equals to {string}', (templatedValue, templatedExpected) => {
    cy.getContext().then((context) => {
        const value = convert(render(templatedValue, context), 'json');
        const expected = render(templatedExpected, context);
        const result = value.some((entry) => entry === expected);

        expect(result).to.equal(true);
    });
});

Then('I expect one resource of {string} equals to {string} as {string}', (templatedValue, templatedExpected, type) => {
    cy.getContext().then((context) => {
        const value = convert(render(templatedValue, context), 'json');
        const expected = convert(render(templatedExpected, context), type);
        const result = value.some((entry) => convert(entry, type) === expected);

        expect(result).to.equal(true);
    });
});

Then('I expect one resource of {string} contains {string} equals to {string}', (templatedValue, templatedField, templatedExpected) => {
    cy.getContext().then((context) => {
        const value = convert(render(templatedValue, context), 'json');
        const field = render(templatedField, context);
        const expected = render(templatedExpected, context);
        const result = value.some((entry) => entry[field] === expected);

        expect(result).to.equal(true);
    });
});

Then('I expect one resource of {string} contains {string} equals to {string} as {string}', (templatedValue, templatedField, templatedExpected, type) => {
    cy.getContext().then((context) => {
        const value = convert(render(templatedValue, context), 'json');
        const field = render(templatedField, context);
        const expected = convert(render(templatedExpected, context), type);
        const result = value.some((entry) => convert(entry[field], type) === expected);

        expect(result).to.equal(true);
    });
});