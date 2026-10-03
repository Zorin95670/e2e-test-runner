const {Client: PgClient} = require('pg');

class DbService {
    constructor() {
        this.client = null;
        this.results = [];
        this.lastQuery = null;
    }

    // You can pass a full connection string or individual parts.
    initDb({connectionString, driver, user, password, host, port, database}) {
        const cfg = connectionString
            ? {connectionString}
            : {user, password, host, port, database};

        // we currenly only manage postgres driver
        if (driver === 'postgres' || (connectionString && connectionString.indexOf('postgres') === 0)) {
            this.client = new PgClient(cfg);
            this.client.connect();
        } else {
            throw new Error('Unknown db protocol, only postgres managed currently');
        }

        return null;
    }

    /**
     * sqlRequest:   string  the whole sql request with optional $1, $2, etc. placeholders
     * values:       array   (optional) values to bind to placeholders
     *
     * Examples:
     * - Raw SQL: { sqlRequest: "SELECT * FROM users" }
     * - Parameterized: { sqlRequest: "INSERT INTO users (name, age) VALUES ($1, $2)", values: ["John", 30] }
     */
    async runDbRequest({sqlRequest, values}) {
        this.lastQuery = sqlRequest;

        try {
            const res = await this.client.query(sqlRequest, values);
            this.results = res.rows || [];
            return null;
        } catch (err) {
            console.error('Db query error:', err);
            throw err;
        }
    }

    getDbResults() {
        return this.results;
    }

    clearDb() {
        this.results = [];
        this.lastQuery = null;
        return null;
    }

    closeDb() {
        if (this.client) {
            return this.client.end();
        }
        return null;
    }
}

module.exports = DbService;
