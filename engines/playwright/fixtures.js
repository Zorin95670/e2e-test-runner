const { test: base, createBdd } = require('playwright-bdd');
const DbService = require('../../core/services/db');
const KafkaService = require('../../core/services/kafka');
const LdapService = require('../../core/services/ldap');

const test = base.extend({
    // Scenario context used for template rendering, equivalent of the Cypress `getContext` command.
    world: async ({}, use) => {
        await use({
            env: { ...process.env },
            ctx: {},
            httpHeaders: {},
            originUrl: null,
        });
    },
    db: async ({}, use) => {
        const db = new DbService();

        await use(db);
        db.clearDb();
        await db.closeDb();
    },
    kafka: async ({}, use) => {
        const kafka = new KafkaService();

        await use(kafka);
        await kafka.clearKafka();
    },
    ldap: async ({}, use) => {
        const ldap = new LdapService();

        await use(ldap);
        ldap.clearLdap();
    },
});

module.exports = {
    test,
    ...createBdd(test),
};
