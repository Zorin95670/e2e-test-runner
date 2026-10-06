import { Then, When } from '@badeball/cypress-cucumber-preprocessor';
import axe from 'axe-core';
import { AXE_OPTIONS, formatViolations, violationsAbove } from '../../../core/rgaa';

// Violations of the last analysis, stored in `ctx.rgaa`.
function getViolations() {
    return cy.getContext().then(({ ctx }) => ctx.rgaa);
}

When('I run an RGAA accessibility analysis on the current page', () => {
    cy.window().then((win) => {
        win.eval(axe.source);

        return win.axe.run(win.document, AXE_OPTIONS);
    }).then(({ violations }) => {
        cy.getContext().then(({ ctx }) => {
            ctx.rgaa = violations;

            return cy.setContext({ ctx });
        });
    });
});

Then('I expect the page to have no accessibility violations', () => {
    getViolations().then((violations) => {
        expect(violations, formatViolations(violations)).to.have.length(0);
    });
});

Then('I expect the page to have no accessibility violations above {string}', (impact) => {
    getViolations().then((violations) => {
        const above = violationsAbove(violations, impact);

        expect(above, formatViolations(above)).to.have.length(0);
    });
});

Then('I expect the page to have at most {int} accessibility violations', (max) => {
    getViolations().then((violations) => {
        expect(violations.length, formatViolations(violations)).to.be.at.most(max);
    });
});
