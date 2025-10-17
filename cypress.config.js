const {defineConfig} = require("cypress");
const createBundler = require("@bahmutov/cypress-esbuild-preprocessor");
const addCucumberPreprocessorPlugin =
    require("@badeball/cypress-cucumber-preprocessor").addCucumberPreprocessorPlugin;
const createEsbuildPlugin =
    require("@badeball/cypress-cucumber-preprocessor/esbuild").createEsbuildPlugin;
const dotenv = require("dotenv");
const path = require('path');
const {Kafka, logLevel} = require('kafkajs');
const he = require('he');
const { Client } = require('ldapts');
const { Client: PgClient } = require('pg');

dotenv.config();

const absolutePath = path.resolve(process.env.CYPRESS_FEATURES_PATH);

module.exports = defineConfig({
    e2e: {
        env: process.env,
        specPattern: `${absolutePath}/**/secu*.feature`,
        supportFile: 'support/e2e.js',
        reporter: require.resolve('@badeball/cypress-cucumber-preprocessor/pretty-reporter'),
        async setupNodeEvents(on, config) {
            await addCucumberPreprocessorPlugin(on, config);
            on(
                "file:preprocessor",
                createBundler({
                    plugins: [createEsbuildPlugin(config)],
                })
            );
            let kafka;
            let producer;
            let consumer;
            let kafkaMessages = {};
            let ldapClient;
            let ldapResults = [];
            let dbClient;
            let dbResults = [];
            let dbLastQuery = null;

            on('task', {
                log(message) {
                    console.log(message);
                    return null;
                },
                logKafkaMessages() {
                    console.log(kafkaMessages);
                    return null;
                },
                clearKafka() {
                    const tasks = [];

                    if (consumer) {
                        tasks.push(consumer.disconnect().catch(() => {
                        }));
                        consumer = null;
                    }

                    if (producer) {
                        tasks.push(producer.disconnect().catch(() => {
                        }));
                        producer = null;
                    }

                    kafkaMessages = {};

                    return Promise.all(tasks).then(() => null);
                },
                initKafka({clientId, broker}) {
                    kafka = new Kafka({
                        clientId: clientId,
                        brokers: [broker],
                        logLevel: logLevel.ERROR,
                    });
                    return null;
                },
                initKafkaProducer() {
                    producer = kafka.producer();
                    return null;
                },
                initKafkaConsumer({groupId}) {
                    consumer = kafka.consumer({groupId});
                    return null;
                },
                sendKafkaMessage({topic, value}) {
                    return producer
                        .connect()
                        .then(() => producer.send({topic, messages: [{value}]}))
                        .then(() => producer.disconnect())
                        .then(() => null);
                },
                listenKafkaTopic({topic}) {
                    consumer
                        .connect()
                        .then(() => consumer.subscribe({topic, fromBeginning: true}))
                        .then(() => consumer.run({
                            eachMessage: async ({message}) => {
                                if (!kafkaMessages[topic]) {
                                    kafkaMessages[topic] = [];
                                }

                                kafkaMessages[topic].push(he.decode(message.value.toString()));
                            },
                        }));
                    return null;
                },
                getKafkaMessages({topic}) {
                    return kafkaMessages[topic] || [];
                },
                clearLdap() {
                    if (ldapClient) {
                        ldapClient.unbind();
                        ldapResults = [];
                    }
                    return null;
                },
                // for doc about ldapts, see https://github.com/ldapts/ldapts
                async initLdap({url, bindDn, password}) {
                    // TODO could be better to initiate timeouts, connectsTimeouts?
                    ldapClient = new Client({
                        url: url,
                        timeout: 5000,
                        connectTimeout: 10000,
                        strictDN: true
                    });
                    try {
                        await ldapClient.bind(bindDn, password);
                    }
                    catch (err) {
                        console.error('Ldap bind error:', err);
                    }

                    return null;
                },
                async runLdapSearch({baseDn, filter, attributes}) {

                    const opts = {
                        filter: filter,
                        scope: 'sub',
                        attributes: attributes,
                    };

                    try {
                        const entries = await ldapClient.search(baseDn, opts);
                        // entries are returned into a specific property
                        if (entries.searchEntries) {
                            ldapResults = entries.searchEntries;
                        }
                    }
                    catch (err) {
                        console.error('Ldap search error:', err)
                    }
                    return null;
                },
                getLdapResults() {
                    return ldapResults;
                },
                deleteLdapResults() {
                    try {
                        ldapResults.forEach( entry => ldapClient.del(entry.dn));
                        ldapResults = [];
                    }
                    catch (err) {
                        console.error('Ldap delete error:', err)
                    }
                    return null;
                },
                addLdapEntry({entryDn, entry}) {
                    try {
                        ldapClient.add(entryDn, entry);
                    }
                    catch (err) {
                        console.error('Ldap add error:', err)
                    }
                    return null;
                },
                // You can pass a full connection string or individual parts.
                initDb({ connectionString, driver, user, password, host, port, database }) {
                    const cfg = connectionString
                        ? { connectionString }
                        : { user, password, host, port, database };

                    // we currenly only manage postgres driver
                    if (cfg.driver === 'postgres' || cfg.connectionString.indexOf('postgres') === 0) {
                        dbClient = new PgClient(cfg);
                        dbClient.connect();
                    }
                    else {
                        throw new Error("Unknown db protocol, only postgres managed currently");
                    }
                    return null;
                },

                /**
                 * table:   string   (e.g. "users")
                 * filter:  string   (SQL WHERE clause without the word WHERE, e.g. "age > 30 AND name ILIKE '%john%'")
                 * columns: string   (space separated list, e.g. "id name email")
                 */
                runDbSearch({ table, filter, columns }) {
                    const cols = columns.split(/\s+/).join(', ');
                    const sql = `SELECT ${cols} FROM ${table}` + (filter ? ` WHERE ${filter}` : '');
                    console.log(sql);

                    dbLastQuery = sql;
                    return dbClient
                        .query(sql)
                        .then(res => {
                            dbResults = res.rows;
                            return null;
                        })
                        .catch(err => {
                            console.error('Db search error:', err);
                            throw err;
                        });
                },

                getDbResults() {
                    return dbResults;
                },

                deleteDbResults() {
                    // nothing to delete
                    if (!dbLastQuery) return null;

                    // reuse the same WHERE clause we used for the SELECT.
                    const whereClause = dbLastQuery.split('WHERE')[1];
                    // no WHERE, nothing to delete
                    if (!whereClause) return null;

                    const deleteSql = `DELETE FROM ${dbLastQuery
                        .match(/^SELECT\s+.+?\s+FROM\s+(\S+)/i)[1]} WHERE ${whereClause}`;

                    return dbClient
                        .query(deleteSql)
                        .then(() => {
                            dbResults = [];
                            dbLastQuery = null;
                            return null;
                        })
                        .catch(err => {
                            console.error('Db delete error:', err);
                            throw err;
                        });
                },

                addTableRow({ tableName, rowData }) {
                    if (typeof tableName !== 'string' || !tableName.trim()) {
                        throw new Error('addTableRow: `tableName` must be a non‑empty string');
                    }
                    if (typeof rowData !== 'object' || rowData === null) {
                        throw new Error('addTableRow: `rowData` must be an object');
                    }

                    const columns = Object.keys(rowData);
                    const values  = Object.values(rowData);

                    // We must **quote** identifiers because table/column names may be camelCase or
                    // reserved words. PostgreSQL double‑quotes are safe as long as we escape any
                    // embedded double‑quote by doubling it.
                    const quoteIdent = (ident) => `"${ident.replace(/"/g, '""')}"`;

                    const columnList = columns.map(quoteIdent).join(', ');
                    const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');

                    const sql = `INSERT INTO ${quoteIdent(tableName)} (${columnList})
                                 VALUES (${placeholders})
                                 RETURNING *;`;

                    return dbClient
                        .query(sql, values)
                        .then( () => { return null })
                        .catch(err => {
                            console.error('Db create error:', err);
                            throw err;
                        });

                },

                clearDb() {
                    dbResults = [];
                    dbLastQuery = null;
                    return null;
                },

                closeDb() {
                    if (dbClient) {
                        return dbClient.end();
                    }
                    return null;
                },

            });

            return config;
        },
    }
});
