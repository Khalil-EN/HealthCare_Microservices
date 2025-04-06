const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('mongoose');
const Consul = require('consul');



const {getDoctors, getDoctor, addDoctor, updateDoctor, deleteDoctor} = require('./Controller/doctorController');
const startConsumer = require('./kafka/consumer');


startConsumer();


const app = express();
const consul = new Consul();


const PORT = 4000;
const DB_URL = 'mongodb://localhost:27017/patientDB';
const DOCTOR_SERVICE = 'doctorService';


app.use(
    cors({
      origin: "http://localhost:3000", 
      methods: "GET,POST,PUT,DELETE",
      credentials: true,
    })
  );

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); 

consul.agent.service.register(
    {
        name: DOCTOR_SERVICE,
        address: 'localhost',
        port: PORT,
        check: {
            http: `http://localhost:${PORT}/health`,
            interval: '10s',
        },
    },
    (err) => {
        if (err) console.error('Consul registration failed:', err);
        else console.log('Doctor service registered with Consul');
    }
);


app.get('/health', (req, res) => res.status(200).send('OK'));
app.get('/doctors/', getDoctors);
app.get('/doctors/:id',getDoctor);
app.post('/doctors',addDoctor);
app.put('/doctors/update/:id',updateDoctor);
app.delete('/doctors/delete/:id',deleteDoctor);


db.connect(DB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
.then(() => {
    app.listen(PORT, () => {
        console.log(`Database connected successfully`);
        console.log(`Server is running on port ${PORT}`);
      });
}).catch((err) => 
    console.log(err)
);
