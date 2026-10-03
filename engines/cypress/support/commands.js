let context = {
    env: Cypress.expose(),
    ctx: {},
    httpHeaders: {},
    originUrl: null,
};

Cypress.Commands.add('getContext', () => context);

Cypress.Commands.add('setContext', (newValues) => {
    context = {...context, ...newValues};
});

Cypress.Commands.add('resetContext', () => {
    context = {
        env: Cypress.expose(),
        ctx: {},
        httpHeaders: {},
        originUrl: null,
    };
});