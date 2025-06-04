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
                }
            });

            return config;
        },
    }
});
