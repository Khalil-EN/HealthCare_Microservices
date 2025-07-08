const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'appointment-service',
  brokers: [process.env.KAFKA_BROKER || 'kafka:9092'], 
});

const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: 'appointment-validator' });
const consumer2 = kafka.consumer({ groupId: 'appointment-validator2' });

const connectProducer = async () => {
  try {
    await producer.connect();
    console.log('Kafka producer connected successfully');
  } catch (error) {
    console.error('Kafka producer connection failed:', error.message);
    // setTimeout(connectProducer, 5000); // retry after 5 seconds
  }
};

connectProducer();

module.exports = { kafka, producer, consumer, consumer2 };
