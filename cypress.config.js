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
const {listFeatures} = require('./lib/features');

dotenv.config();

const absolutePath = path.resolve(process.env.CYPRESS_FEATURES_PATH);
const chromeSecurityEnabled = process.env.CYPRESS_CHROME_SECURITY_ENABLED !== 'false';

module.exports = defineConfig({
    e2e: {
        chromeWebSecurity: chromeSecurityEnabled,
        env: process.env,
        specPattern: `${absolutePath}/**/*.feature`,
        supportFile: 'support/e2e.js',
        reporter: require.resolve('@badeball/cypress-cucumber-preprocessor/pretty-reporter'),
        async setupNodeEvents(on, config) {
            // In `cypress run`, replace the glob by the sorted list of feature files so that the
            // execution order is identical on every machine. `cypress open` keeps the glob to keep
            // watching for new feature files.
            if (config.isTextTerminal) {
                config.specPattern = listFeatures(absolutePath);
            }

            await addCucumberPreprocessorPlugin(on, config);
            on(
                "file:preprocessor",
                createBundler({
                    plugins: [createEsbuildPlugin(config)],
                })
            );

            on('before:browser:launch', (browser, launchOptions) => {
                if (!chromeSecurityEnabled && browser.family === 'chromium') {
                    launchOptions.args.push('--ignore-certificate-errors');
                    launchOptions.args.push('--allow-insecure-localhost');
                }
                return launchOptions;
            });

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
                    if (driver === 'postgres' || (connectionString && connectionString.indexOf('postgres') === 0)) {
                        dbClient = new PgClient(cfg);
                        dbClient.connect();
                    }
                    else {
                        throw new Error("Unknown db protocol, only postgres managed currently");
                    }
                    return null;
                },

                /**
                 * sqlRequest:   string  the whole sql request with optional $1, $2, etc. placeholders
                 * values:       array   (optional) values to bind to placeholders
                 *
                 * Examples:
                 * - Raw SQL: { sqlRequest: "SELECT * FROM users" }
                 * - Parameterized: { sqlRequest: "INSERT INTO users (name, age) VALUES ($1, $2)", values: ["John", 30] }
                 */
                runDbRequest({ sqlRequest, values }) {
                    dbLastQuery = sqlRequest;
                    return dbClient
                        .query(sqlRequest, values)
                        .then(res => {
                            dbResults = res.rows || [];
                            return null;
                        })
                        .catch(err => {
                            console.error('Db query error:', err);
                            throw err;
                        });
                },

                getDbResults() {
                    return dbResults;
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
