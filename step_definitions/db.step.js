import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";
import { render } from "./utils";

afterEach(() => {
    cy.task('clearDb');
});

Given("I setup database with {string}", (templatedConnectionString) => {
      return cy.getContext().then(ctx => {
          const connectionString = render(templatedConnectionString, ctx);
          return cy.task("initDb", { connectionString });
      });
  }
);

Given("I setup database with driver {string} host {string} port {int} user {string} password {string} database {string}",
        (templatedDriver, templatedHost, port, templatedUser, templatedPassword, templatedDatabase) => {
      return cy.getContext().then(ctx => {
          const driver = render(templatedDriver, ctx);
          const host = render(templatedHost, ctx);
          const user = render(templatedUser, ctx);
          const password = render(templatedPassword, ctx);
          const database = render(templatedDatabase, ctx);
          return cy.task("initDb", { driver, host, port, user, password, database });
      });
  }
);

When("I execute sql request {string}", (templatedSqlRequest) => {
    return cy.getContext().then(context => {
        const sqlRequest = render(templatedSqlRequest, context);
        return cy.task("runDbRequest", { sqlRequest }).then(() => {
            return cy.task("getDbResults").then(results => {
                const {ctx} = context;
                ctx.dbResults = results;
                return cy.setContext({ctx});
            });
        });
    });
  }
);

When("I execute sql request {string} with values:", (templatedSqlRequest, valuesJson) => {
    return cy.getContext().then(context => {
        const sqlRequest = render(templatedSqlRequest, context);
        const renderedJson = render(valuesJson, context);
        const values = JSON.parse(renderedJson);

        return cy.task("runDbRequest", { sqlRequest, values }).then(() => {
            return cy.task("getDbResults").then(results => {
                const {ctx} = context;
                ctx.dbResults = results;
                return cy.setContext({ctx});
            });
        });
    });
  }
);

Then("I expect {int} database results", expected => {
    return cy.task("getDbResults").then(rows => {
        expect(rows.length).to.equal(expected);
    });
});
