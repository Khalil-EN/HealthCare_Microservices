const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('mongoose');
const Consul = require('consul');


const {getPatients, getPatient, createPatient, updatePatient, deletePatient} = require('./Controllers/patientController');
const startConsumer = require('./kafka/consumer');


startConsumer();


const CONSUL_HOST = process.env.CONSUL_HOST || 'consul';
const CONSUL_PORT = 8500;


const app = express();
const consul = new Consul({ host: CONSUL_HOST, port: CONSUL_PORT });


const PORT = 4002;
const DB_URL = 'mongodb://root:example@mongo:27017/patientDB?authSource=admin';
const PATIENT_SERVICE = 'patientService';



app.use(
    cors({
      origin: "http://localhost:3000",
      methods: "GET,POST,PUT,PATCH,DELETE",
      credentials: true, 
    })
  );

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); 



consul.agent.service.register(
    {
        name: PATIENT_SERVICE,
        address: 'patientservice',
        port: PORT,
        check: {
            http: `http://patientservice:${PORT}/health`,
            interval: '10s',
        },
    },
    (err) => {
        if (err) console.error('Consul registration failed:', err);
        else console.log('Patient service registered with Consul');
    }
);



app.get('/health', (req, res) => res.status(200).send('OK'));
app.get('/patients', getPatients);    
app.get('/patients/:id', getPatient);
app.post('/patients', createPatient);
app.put('/patients/update/:id', updatePatient);
app.delete('/patients/delete/:id', deletePatient);




db.connect(DB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
.then(() => {
    app.listen(PORT, () => {
        console.log(`Database connected successfully`);
        console.log(`Server is running on port ${PORT}`);
      });
}).catch((err) => 
    console.log(err)
);
