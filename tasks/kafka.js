const {Kafka, logLevel} = require('kafkajs');
const he = require('he');

class KafkaTasks {
    constructor() {
        this.kafka = null;
        this.producer = null;
        this.consumer = null;
        this.messages = {};
    }

    logKafkaMessages() {
        console.log(this.messages);
        return null;
    }

    async clearKafka() {
        const disconnects = [];

        if (this.consumer) {
            disconnects.push(this.consumer.disconnect().catch(() => {}));
            this.consumer = null;
        }

        if (this.producer) {
            disconnects.push(this.producer.disconnect().catch(() => {}));
            this.producer = null;
        }

        this.messages = {};

        await Promise.all(disconnects);
        return null;
    }

    initKafka({clientId, broker}) {
        this.kafka = new Kafka({
            clientId,
            brokers: [broker],
            logLevel: logLevel.ERROR,
        });
        return null;
    }

    initKafkaProducer() {
        this.producer = this.kafka.producer();
        return null;
    }

    initKafkaConsumer({groupId}) {
        this.consumer = this.kafka.consumer({groupId});
        return null;
    }

    async sendKafkaMessage({topic, value}) {
        await this.producer.connect();
        await this.producer.send({topic, messages: [{value}]});
        await this.producer.disconnect();
        return null;
    }

    async listenKafkaTopic({topic}) {
        await this.consumer.connect();
        await this.consumer.subscribe({topic, fromBeginning: true});
        this.consumer.run({
            eachMessage: async ({message}) => {
                if (!this.messages[topic]) {
                    this.messages[topic] = [];
                }

                this.messages[topic].push(he.decode(message.value.toString()));
            },
        });
        return null;
    }

    getKafkaMessages({topic}) {
        return this.messages[topic] || [];
    }
}

module.exports = KafkaTasks;
