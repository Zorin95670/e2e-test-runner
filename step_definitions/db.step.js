import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";
import { render } from "./utils";

afterEach(() => {
    cy.task('clearDb');
});

Given("I setup database with connection string {string}", (templatedConnectionString) => {
      return cy.getContext().then(ctx => {
          const connectionString = render(templatedConnectionString, ctx);
          return cy.task("initDb", { connectionString });
      });
  }
);

Given("I setup database with driver {string} host {string} port {int} user {string} password {string} database {string}",
        (templatedHost, templatedPort, templatedUser, templatedPassword, templatedDatabase) => {
      return cy.getContext().then(ctx => {
          const driver = render(templatedDriver, ctx);
          const host = render(templatedHost, ctx);
          const user = render(templatedUser, ctx);
          const password = render(templatedPassword, ctx);
          const database = render(templatedDatabase, ctx);
          return cy.task("initDb", { driver, host, user, password, database });
      });
  }
);

When("I search db table {string} with filter {string} and columns {string}", (templatedTable, templatedFilter, templatedColumns) => {
    return cy.getContext().then(ctx => {
        const table = render(templatedTable, ctx);
        const filter = render(templatedFilter, ctx);
        const columns = render(templatedColumns, ctx);
        return cy.task("runDbSearch", { table, filter, columns });
    });
  }
);

When('I add a row to table {string} with values:',
    (templatedTableName, rowJson) => {
        return cy.getContext().then(context => {
            const tableName   = render(templatedTableName, context);
            const rowData     = JSON.parse(rowJson);

            return cy.task('addTableRow', { tableName, rowData });
        });
    }
);

Then("I expect {int} db results", expected => {
    return cy.task("getDbResults").then(rows => {
        expect(rows.length).to.equal(expected);
    });
});

Then("I delete all db results", () => {
    return cy.task("deleteDbResults");
});
