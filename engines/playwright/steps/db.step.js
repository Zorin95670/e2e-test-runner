const { expect } = require('@playwright/test');
const { Given, Then, When } = require('../fixtures');
const { render } = require('../../../core/utils');

Given('I setup database with {string}', async ({ db, world }, templatedConnectionString) => {
    db.initDb({ connectionString: render(templatedConnectionString, world) });
});

Given('I setup database with driver {string} host {string} port {int} user {string} password {string} database {string}',
    async ({ db, world }, templatedDriver, templatedHost, port, templatedUser, templatedPassword, templatedDatabase) => {
        db.initDb({
            driver: render(templatedDriver, world),
            host: render(templatedHost, world),
            port,
            user: render(templatedUser, world),
            password: render(templatedPassword, world),
            database: render(templatedDatabase, world),
        });
    });

When('I execute sql request {string}', async ({ db, world }, templatedSqlRequest) => {
    await db.runDbRequest({ sqlRequest: render(templatedSqlRequest, world) });
    world.ctx.dbResults = db.getDbResults();
});

When('I execute sql request {string} with values:', async ({ db, world }, templatedSqlRequest, valuesJson) => {
    const sqlRequest = render(templatedSqlRequest, world);
    const values = JSON.parse(render(valuesJson, world));

    await db.runDbRequest({ sqlRequest, values });
    world.ctx.dbResults = db.getDbResults();
});

Then('I expect {int} database results', async ({ db }, expected) => {
    expect(db.getDbResults().length).toBe(expected);
});
