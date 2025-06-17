import {Given, Then, When} from "@badeball/cypress-cucumber-preprocessor";
import {convert, render} from "./utils";

afterEach(() => {
    cy.task('clearLdap');
});

Given('I setup ldap with url {string} bind dn {string} and password {string}', (templatedUrl, templatedBindDn, templatedPassword) => {
    cy.getContext().then((context) => {
        const url = render(templatedUrl, context);
        const bindDn = render(templatedBindDn, context);
        const password = render(templatedPassword, context);

        return cy.task('initLdap', {url, bindDn, password});
    });
});

When('I search ldap results on base dn {string} with filter {string} and attributes {string}', (templatedBaseDn, templatedFilter, templatedAttributes) => {
    return cy.getContext().then((context) => {
        const baseDn = render(templatedBaseDn, context);
        const filter = render(templatedFilter, context);
        const attributes = render(templatedAttributes, context).split(' ');

        return cy.task('runLdapSearch', {baseDn, filter, attributes});
    });
});

When('I add a ldap entry with dn {string} and with attributes:', (templatedEntryDn, docString) => {
    return cy.getContext().then((context) => {
        const entryDn = render(templatedEntryDn, context);
        const entry = JSON.parse(render(docString, context));

        return cy.task('addLdapEntry', {entryDn, entry});
    });
});

When('I add a ldap entry with dn {string} and with attributes {string}', (templatedEntryDn, templatedValue) => {
    return cy.getContext().then((context) => {
        const entryDn = render(templatedEntryDn, context);
        const entry = JSON.parse(render(templatedValue, context));

        return cy.task('addLdapEntry', {entryDn, entry});
    });
});

Then('I expect {int} ldap results', (expectedLength) => {

    cy.getContext().then((context) => {
        return cy.task('getLdapResults');
    }).then((messages) => {
        expect(messages.length).to.equal(parseInt(expectedLength, 10));
    });
});

Then('I delete all ldap results', () => {
    cy.getContext().then((context) => {
        return cy.task('deleteLdapResults');
    });
});


