const { producer, consumer, consumer2 } = require('./kafkaClient');
const { v4: uuidv4 } = require('uuid');

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

let isConsumerRunning = false;
let isConsumer2Running = false;


const pendingDoctorRequests = new Map(); // requestId -> resolve function

// Start the consumer ONCE
const startDoctorConsumer = async () => {
  await consumer.connect();
  await consumer.subscribe({ topic: 'validate-doctor-response', fromBeginning: false });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const { requestId, valid } = JSON.parse(message.value.toString());
      console.log(`[AppointmentService] Received validation response for ${requestId}: ${valid}`);
      
      // If there's a pending request, resolve it
      const resolver = pendingDoctorRequests.get(requestId);
      if (resolver) {
        resolver(valid);
        pendingDoctorRequests.delete(requestId);
      }
    }
  });
};

// This gets called every time you validate a doctor
const validateDoctor = async (doctorId) => {
  const requestId = uuidv4();

  // Send validation request
  await producer.send({
    topic: 'validate-doctor',
    messages: [
      {
        key: requestId,
        value: JSON.stringify({ doctorId, requestId }),
      },
    ],
  });

  // Return a promise that resolves when the response arrives or timeout
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      pendingDoctorRequests.delete(requestId);
      reject(new Error("Timeout waiting for doctor validation"));
    }, 5000); // 5s timeout

    pendingDoctorRequests.set(requestId, (valid) => {
      clearTimeout(timeout);
      resolve(valid);
    });
  });
};

const pendingPatientRequests = new Map(); // requestId -> resolve function

let isPatientConsumerStarted = false;

// Start the patient response consumer once
const startPatientConsumer = async () => {
  if (isPatientConsumerStarted) return;

  await consumer2.connect();
  await consumer2.subscribe({ topic: 'validate-patient-response', fromBeginning: false });

  await consumer2.run({
    eachMessage: async ({ topic, partition, message }) => {
      const { requestId, valid } = JSON.parse(message.value.toString());
      console.log(`[AppointmentService] Received validation response for ${requestId}: ${valid}`);

      const resolver = pendingPatientRequests.get(requestId);
      if (resolver) {
        resolver(valid);
        pendingPatientRequests.delete(requestId);
      }
    }
  });

  isPatientConsumerStarted = true;
};

// This gets called every time you validate a patient
const validatePatient = async (patientId) => {
  const requestId = uuidv4();

  // Send validation request
  await producer.send({
    topic: 'validate-patient',
    messages: [
      {
        key: requestId,
        value: JSON.stringify({ patientId, requestId }),
      },
    ],
  });

  // Return a promise that resolves when response arrives or timeout
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      pendingPatientRequests.delete(requestId);
      reject(new Error("Timeout waiting for patient validation"));
    }, 5000); // Timeout duration

    pendingPatientRequests.set(requestId, (valid) => {
      clearTimeout(timeout);
      resolve(valid);
    });
  });
};



module.exports = { validateDoctor, validatePatient, startDoctorConsumer,startPatientConsumer};