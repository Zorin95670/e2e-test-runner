import {Given, Then, When} from "@badeball/cypress-cucumber-preprocessor";
import {convert, render} from "./utils";

afterEach(() => {
    cy.task('clearKafka');
});

Given('I setup kafka with clientId {string} and broker {string}', (templatedClientId, templatedBroker) => {
    cy.getContext().then((context) => {
        const clientId = render(templatedClientId, context);
        const broker = render(templatedBroker, context);

        return cy.task('initKafka', {clientId, broker});
    });
});

Given('I setup kafka producer', () => {
    return cy.task('initKafkaProducer');
});

Given('I setup kafka consumer with groupId {string}', (templatedGroupId) => {
    return cy.getContext().then((context) => {
        const groupId = render(templatedGroupId, context);

        return cy.task('initKafkaConsumer', {groupId});
    });
});

When('I send a Kafka message on the topic {string} with body {string}', (templatedTopic, templatedBody) => {
    return cy.getContext().then((context) => {
        const topic = render(templatedTopic, context);
        const value = JSON.stringify(JSON.parse(render(templatedBody, context)));

        return cy.task('sendKafkaMessage', {topic, value});
    });
});

When('I send a Kafka message on the topic {string} with body:', (templatedTopic, docString) => {
    return cy.getContext().then((context) => {
        const topic = render(templatedTopic, context);
        const value = JSON.stringify(JSON.parse(render(docString, context)));

        return cy.task('sendKafkaMessage', {topic, value});
    });
});

Given('I listen for Kafka messages on the topic {string}', (templatedTopic) => {
    return cy.getContext().then((context) => {
        const topic = render(templatedTopic, context);

        return cy.task('listenKafkaTopic', {topic});
    });
});

Then('I expect {int} message(s) received on Kafka topic {string}', (expectedLength, templatedTopic) => {
    return cy.getContext().then((context) => {
        const topic = render(templatedTopic, context);

        return cy.task('getKafkaMessages', {topic});
    }).then((messages) => {
        expect(messages.length).to.equal(expectedLength);
    });
});

Then('I expect a message on Kafka topic {string} equals to {string}', (templatedTopic, templatedMessage) => {
    let message;
    return cy.getContext().then((context) => {
        const topic = render(templatedTopic, context);
        message = render(templatedMessage, context);

        return cy.task('getKafkaMessages', {topic});
    }).then((messages) => {
        const found = messages.some(msg => msg === message);

        expect(found).to.equal(true);
    });
});

Then('I expect a message on Kafka topic {string} equals to {string} as {string}', (templatedTopic, templatedMessage, type) => {
    let message;
    return cy.getContext().then((context) => {
        const topic = render(templatedTopic, context);
        message = convert(render(templatedMessage, context), type);

        return cy.task('getKafkaMessages', {topic});
    }).then((messages) => {
        const found = messages.some(msg => {
            if ('json' !== type) {
                return msg === message;
            }

            return JSON.stringify(JSON.parse(msg)) === JSON.stringify(message);
        });


        expect(found).to.equal(true);
    });
});

Then('I expect a message on Kafka topic {string} equals to:', (templatedTopic, docString) => {
    let message;
    return cy.getContext().then((context) => {
        const topic = render(templatedTopic, context);
        message = render(templatedMessage, context);

        return cy.task('getKafkaMessages', {topic});
    }).then((messages) => {
        const found = messages.some(msg => msg === message);

        expect(found).to.equal(true);
    });
});

Then('I expect a message on Kafka topic {string} contains {string}', (templatedTopic, templatedMessage) => {
    let message;
    return cy.getContext().then((context) => {
        const topic = render(templatedTopic, context);
        message = render(templatedMessage, context);

        return cy.task('getKafkaMessages', {topic});
    }).then((messages) => {
        const found = messages.some(msg => msg === msg.includes(message));

        expect(found).to.equal(true);
    });
});

Then('I expect a message on Kafka topic {string} contains:', (templatedTopic, docString) => {
    let message;
    return cy.getContext().then((context) => {
        const topic = render(templatedTopic, context);
        message = render(docString, context);

        return cy.task('getKafkaMessages', {topic});
    }).then((messages) => {
        const found = messages.some(msg => msg === msg.includes(message));

        expect(found).to.equal(true);
    });
});

Then('I expect a message on Kafka topic {string} matches regex {string}', (templatedTopic, templatedRegex) => {
    let regex;
    return cy.getContext().then((context) => {
        const topic = render(templatedTopic, context);
        regex = new RegExp(render(templatedRegex, context));

        return cy.task('getKafkaMessages', {topic});
    }).then((messages) => {
        const found = messages.some(msg => regex.test(msg));

        expect(found).to.equal(true);
    });
});

Then('I log kafka messages', () => {
    cy.task('logKafkaMessages');
})