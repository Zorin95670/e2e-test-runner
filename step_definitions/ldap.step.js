import {Given, Then, When} from "@badeball/cypress-cucumber-preprocessor";
import {convert, render} from "./utils";

afterEach(() => {
    cy.task('clearLdap');
});

Given('I setup Ldap with url {string} bind dn {string} and password {string}', (templatedUrl, templatedBindDn, templatedPassword) => {
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

Then('I expect {int} ldap results', (expectedLength) => {
    cy.getContext().then((context) => {

        return cy.getContext().then((context) => {
            return cy.task('getLdapResults');
        }).then((messages) => {
            expect(messages.length).to.equal(parseInt(expectedLength, 10));
        });
    });
});


Then('I delete all ldap results', () => {
    cy.getContext().then((context) => {
        return cy.getContext().then((context) => {
            return cy.task('deleteLdapResults');
        })
    });
});


