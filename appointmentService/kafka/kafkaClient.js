const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'appointment-service',
  brokers: ['localhost:9092'],
});

const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: 'appointment-validator' });
const consumer2 = kafka.consumer({ groupId: 'appointment-validator2' });

const connectProducer = async () => {
  await producer.connect();
};


connectProducer();

module.exports = { kafka, producer, consumer, consumer2 };
