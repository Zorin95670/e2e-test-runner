const { expect } = require('@playwright/test');
const { Given, Then, When } = require('../fixtures');
const { render } = require('../../../core/utils');

Given('I setup ldap with url {string} bind dn {string} and password {string}', async ({ ldap, world }, templatedUrl, templatedBindDn, templatedPassword) => {
    await ldap.initLdap({
        url: render(templatedUrl, world),
        bindDn: render(templatedBindDn, world),
        password: render(templatedPassword, world),
    });
});

When('I search ldap results on base dn {string} with filter {string} and attributes {string}', async ({ ldap, world }, templatedBaseDn, templatedFilter, templatedAttributes) => {
    await ldap.runLdapSearch({
        baseDn: render(templatedBaseDn, world),
        filter: render(templatedFilter, world),
        attributes: render(templatedAttributes, world).split(' '),
    });
});

When('I add a ldap entry with dn {string} and with attributes:', async ({ ldap, world }, templatedEntryDn, docString) => {
    await ldap.addLdapEntry({
        entryDn: render(templatedEntryDn, world),
        entry: JSON.parse(render(docString, world)),
    });
});

When('I add a ldap entry with dn {string} and with attributes {string}', async ({ ldap, world }, templatedEntryDn, templatedValue) => {
    await ldap.addLdapEntry({
        entryDn: render(templatedEntryDn, world),
        entry: JSON.parse(render(templatedValue, world)),
    });
});

Then('I expect {int} ldap results', async ({ ldap }, expectedLength) => {
    expect(ldap.getLdapResults().length).toBe(expectedLength);
});

Then('I delete all ldap results', async ({ ldap }) => {
    await ldap.deleteLdapResults();
});
