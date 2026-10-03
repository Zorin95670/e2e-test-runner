const {Client} = require('ldapts');

class LdapTasks {
    constructor() {
        this.client = null;
        this.results = [];
    }

    clearLdap() {
        if (this.client) {
            this.client.unbind();
            this.client = null;
            this.results = [];
        }
        return null;
    }

    // for doc about ldapts, see https://github.com/ldapts/ldapts
    async initLdap({url, bindDn, password}) {
        // TODO could be better to initiate timeouts, connectsTimeouts?
        this.client = new Client({
            url,
            timeout: 5000,
            connectTimeout: 10000,
            strictDN: true,
        });

        try {
            await this.client.bind(bindDn, password);
        } catch (err) {
            console.error('Ldap bind error:', err);
        }

        return null;
    }

    async runLdapSearch({baseDn, filter, attributes}) {
        const opts = {
            filter,
            scope: 'sub',
            attributes,
        };

        try {
            const entries = await this.client.search(baseDn, opts);
            // entries are returned into a specific property
            if (entries.searchEntries) {
                this.results = entries.searchEntries;
            }
        } catch (err) {
            console.error('Ldap search error:', err);
        }

        return null;
    }

    getLdapResults() {
        return this.results;
    }

    async deleteLdapResults() {
        try {
            await Promise.all(this.results.map(entry => this.client.del(entry.dn)));
        } catch (err) {
            console.error('Ldap delete error:', err);
        }

        this.results = [];

        return null;
    }

    async addLdapEntry({entryDn, entry}) {
        try {
            await this.client.add(entryDn, entry);
        } catch (err) {
            console.error('Ldap add error:', err);
        }

        return null;
    }
}

module.exports = LdapTasks;
