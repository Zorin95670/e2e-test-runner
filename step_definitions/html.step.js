import {Given, Then, When} from "@badeball/cypress-cucumber-preprocessor";
import {render} from "./utils";

When('I click on {string}', (templatedSelector) => {
    cy.getContext().then((context) => {
        const selector = render(templatedSelector, context);

        cy.get(selector).click();
    });
});

When('I force click on {string}', (templatedSelector) => {
    cy.getContext().then((context) => {
        const selector = render(templatedSelector, context);

        cy.get(selector).click({ force: true });
    });
});

When('I double click on {string}', (templatedSelector) => {
    cy.getContext().then((context) => {
        const selector = render(templatedSelector, context);

        cy.get(selector).dblclick();
    });
});

When('I scroll to {string} into {string}', (position, templatedSelector) => {
    cy.getContext().then((context) => {
        const selector = render(templatedSelector, context);

        cy.get(selector).scrollTo(position);
    });
});

When('I hover {string} to make it visible', (templatedSelector) => {
    cy.getContext().then((context) => {
        const selector = render(templatedSelector, context);

        cy.get(selector).invoke('show').should('be.visible');
    });
});

When('I drag {string} onto {string}', (templatedOriginSelector, templatedDestinationSelector) => {
    cy.getContext().then((context) => {
        const originSelector = render(templatedOriginSelector, context);
        const destinationSelector = render(templatedDestinationSelector, context);

        cy.get(originSelector).drag(destinationSelector, { force: true });
    });
});

When('I drag {string} of {int},{int}', (templatedSelector, x, y) => {
    cy.getContext().then((context) => {
        const selector = render(templatedSelector, context);

        cy.drag(selector, { x, y });
    });
});

When('I select {string} in {string}', (templatedOption, templatedSelector) => {
    cy.getContext().then((context) => {
        const selector = render(templatedSelector, context);
        const option = render(templatedOption, context);

        cy.get(selector)
            .click({ force: true })
            .get(option)
            .click({ force: true })
            .wait(500);
    });
});

When('I move {string} of {int},{int}', (templatedSelector, x, y) => {
    cy.getContext().then((context) => {
        const selector = render(templatedSelector, context);

        cy.get(selector).move({ deltaX: x, deltaY: y, force: true });
    });
});

Then('I expect the HTML element {string} exists', (templatedSelector) => {
    cy.getContext().then((context) => {
        const selector = render(templatedSelector, context);

        cy.get(selector).should('exist');
    });
});

Then('I expect the HTML element {string} not exists', (templatedSelector) => {
    cy.getContext().then((context) => {
        const selector = render(templatedSelector, context);

        cy.get(selector, { timeout: 60000 }).should('not.exist');
    });
});

Then('I expect the HTML element {string} to be visible', (templatedSelector) => {
    cy.getContext().then((context) => {
        const selector = render(templatedSelector, context);

        cy.get(selector).should('be.visible');
    });
});

Then('I expect the HTML element {string} to be hidden', (templatedSelector) => {
    cy.getContext().then((context) => {
        const selector = render(templatedSelector, context);

        cy.get(selector).should('be.hidden');
    });
});

Then('I expect the HTML element {string} to be disabled', (templatedSelector) => {
    cy.getContext().then((context) => {
        const selector = render(templatedSelector, context);

        cy.get(selector).should('be.disabled');
    });
});

Then('I expect the HTML element {string} to be enabled', (templatedSelector) => {
    cy.getContext().then((context) => {
        const selector = render(templatedSelector, context);

        cy.get(selector).should('not.be.disabled');
    });
});

Then('I expect the HTML element {string} width is {int}', (templatedSelector, width) => {
    cy.getContext().then((context) => {
        const selector = render(templatedSelector, context);

        cy.get(selector).should((element) => {
            expect(Math.trunc(element.width())).eq(width);
        });
    });
});

Then('I expect the HTML element {string} height is {int}', (templatedSelector, height) => {
    cy.getContext().then((context) => {
        const selector = render(templatedSelector, context);

        cy.get(selector).should((element) => {
            expect(Math.trunc(element.height())).eq(height);
        });
    });
});

Then('I expect the HTML element {string} to be at position {int},{int}', (templatedSelector, x, y) => {
    cy.getContext().then((context) => {
        const selector = render(templatedSelector, context);

        cy.get(selector).should((element) => {
            expect(Math.trunc(element.position().left)).eq(x);
            expect(Math.trunc(element.position().top)).eq(y);
        });
    });
});

Then('I expect the HTML element {string} to have attribute {string} with value {string}', (templatedSelector, templatedAttribute, templatedValue) => {
    cy.getContext().then((context) => {
        const selector = render(templatedSelector, context);
        const attribute = render(templatedAttribute, context);
        const value = render(templatedValue, context);

        cy.get(selector)
            .invoke('attr', attribute)
            .should('eq', value);
    });
});

Then('I expect the HTML element {string} contains {string}', (templatedSelector, templatedValue) => {
    cy.getContext().then((context) => {
        const selector = render(templatedSelector, context);
        const value = render(templatedValue, context);

        cy.get(selector).contains(value);
    });
});

Then('I expect the HTML element {string} to have value {string}', (templatedSelector, templatedValue) => {
    cy.getContext().then((context) => {
        const selector = render(templatedSelector, context);
        const value = render(templatedValue, context);

        cy.get(selector).should('have.value', value);
    });
});

Then('I expect the HTML element {string} appear {int} time(s) on screen', (templatedSelector, count) => {
    cy.getContext().then((context) => {
        const selector = render(templatedSelector, context);
        const value = render(templatedValue, context);

        cy.get(selector).should('have.length', count);
    });
});

Then('I clear the text in the HTML element {string}', (templatedSelector) => {
    cy.getContext().then((context) => {
        const selector = render(templatedSelector, context);
        const value = render(templatedValue, context);

        cy.get(selector).type('{selectall}{backspace}');
    });
});

Then('I set the text {string} in the HTML element {string}', (templatedValue, templatedSelector) => {
    cy.getContext().then((context) => {
        const selector = render(templatedSelector, context);
        const value = render(templatedValue, context);

        cy.get(selector).type('{selectall}{backspace}');
        cy.get(selector).type(value);
    });
});

Given('I set the viewport size to {int} px by {int} px', (width, height) => {
    cy.viewport(parseInt(width, 10), parseInt(height, 10));
});
