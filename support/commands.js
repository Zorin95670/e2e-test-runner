const defaultContext = {
    env: Cypress.env(),
    ctx: {},
};

let testContext = { ...defaultContext };

Cypress.Commands.add('getContext', () => testContext);

Cypress.Commands.add('setContext', (newValues) => {
    testContext = { ...testContext, ...newValues };
});

Cypress.Commands.add('resetContext', () => {
    testContext = { ...defaultContext };
});