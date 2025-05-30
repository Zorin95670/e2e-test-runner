import {Given, Then} from "@badeball/cypress-cucumber-preprocessor";
import {render} from "./utils";
import {Kafka} from "kafkajs";

Given('I setup kafka with clientId {string} and broker {string}', (templatedClientId, templatedBroker) => {
    cy.getContext().then((context) => {
        const clientId = render(templatedClientId, context);
        const brokers = [render(templatedBroker, context)];

        cy.kafka = new Kafka({
            clientId,
            brokers,
        });
        cy.kafkaConsumers = {};
    });
});

Given('I setup kafka producer', () => {
    cy.kafkaProducer = cy.kafka.producer();
});

Given('I setup kafka consumer with groupId {string}', (templatedGroupId) => {
    cy.getContext().then((context) => {
        const groupId = render(templatedGroupId, context);

        cy.kafkaConsumer = cy.kafka.consumer({ groupId });
    });
});

Given('I listen for Kafka messages on the topic {string}', (templatedTopic) => {
    cy.getContext().then((context) => {
        const topic = render(templatedTopic, context);

        return cy.kafkaConsumer
            .connect()
            .then(() => cy.kafkaConsumer.subscribe({ topic, fromBeginning: true }))
            .then(() => cy.kafkaConsumer.run({
                eachMessage: async ({ message }) => {
                    cy.getContext().then((context) => {
                        const kafkaContext = context.kafka;

                        if (!kafkaContext[topic]) {
                            kafkaContext[topic] = [];
                        }

                        kafkaContext[topic].push(message);

                        cy.setContext({ kafka: kafkaContext });
                    });
                },
            }));
    });
});

Then('I expect {int} message(s) received on Kafka topic {string}', (expectedLength, templatedTopic) => {
    cy.getContext().then((context) => {
        const topic = render(templatedTopic, context);

        expect(context.kafka[topic].length).to.equal(expectedLength);
    });
});

Then('I expect a message on Kafka topic {string} equals to {string}', (templatedTopic, templatedMessage) => {
    cy.getContext().then((context) => {
        const topic = render(templatedTopic, context);
        const message = render(templatedMessage, context);
        const found = context.kafka[topic].some(msg => msg === message);

        expect(found).to.equal(true);
    });
});

Then('I expect a message on Kafka topic {string} equals to:', (templatedTopic, docString) => {
    cy.getContext().then((context) => {
        const topic = render(templatedTopic, context);
        const message = render(docString, context);
        const found = context.kafka[topic].some(msg => msg === message);

        expect(found).to.equal(true);
    });
});

Then('I expect a message on Kafka topic {string} contains {string}', (templatedTopic, templatedMessage) => {
    cy.getContext().then((context) => {
        const topic = render(templatedTopic, context);
        const message = render(templatedMessage, context);
        const found = context.kafka[topic].some(msg => msg.includes(message));

        expect(found).to.equal(true);
    });
});

Then('I expect a message on Kafka topic {string} contains:', (templatedTopic, docString) => {
    cy.getContext().then((context) => {
        const topic = render(templatedTopic, context);
        const message = render(docString, context);
        const found = context.kafka[topic].some(msg => msg.includes(message));

        expect(found).to.equal(true);
    });
});

Then('I expect a message on Kafka topic {string} matches regex {string}', (templatedTopic, templatedRegex) => {
    cy.getContext().then((context) => {
        const topic = render(templatedTopic, context);
        const regex = new RegExp(render(templatedRegex, context));
        const found = context.kafka[topic].some(msg => regex.test(msg));

        expect(found).to.equal(true);
    });
});