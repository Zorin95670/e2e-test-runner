let context = {
    env: Cypress.env(),
    ctx: {},
    httpHeaders: {},
};

Cypress.Commands.add('getContext', () => context);

Cypress.Commands.add('setContext', (newValues) => {
    context = {...context, ...newValues};
});

Cypress.Commands.add('resetContext', () => {
    context = {
        env: Cypress.env(),
        ctx: {},
        httpHeaders: {},
    };
});