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

dotenv.config();

const absolutePath = path.resolve(process.env.CYPRESS_FEATURES_PATH);

module.exports = defineConfig({
    e2e: {
        env: process.env,
        specPattern: `${absolutePath}/**/*.feature`,
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
                }

            });

            return config;
        },
    }
});
