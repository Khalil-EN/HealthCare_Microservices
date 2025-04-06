const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('mongoose');
const Consul = require('consul');


const {getAppointments, getAppointment, createAppointment, updateAppointment, deleteAppointment} = require('./Controllers/appointmentController');
const { startPatientConsumer } = require('./kafka/validators');
const { startDoctorConsumer } = require('./kafka/validators');



const app = express();
const consul = new Consul();





const PORT = 4001;
const DB_URL = 'mongodb://localhost:27017/appointmentDB';
const APPOINTMENT_SERVICE = 'appointmentService';



app.use(
    cors({
      origin: "http://localhost:3000", 
      methods: "GET,POST,PUT,PATCH,DELETE",
      credentials: true, 
    })
  );

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

startPatientConsumer();
startDoctorConsumer();


consul.agent.service.register(
  {
      name: APPOINTMENT_SERVICE,
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
app.get('/appointments', getAppointments);    
app.get('/appointments/:id', getAppointment);
app.post('/appointments', createAppointment);
app.put('/appointments/update/:id', updateAppointment);
app.delete('/appointments/delete/:id', deleteAppointment);





db.connect(DB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
.then(() => {
    app.listen(PORT, () => {
        console.log(`Database connected successfully`);
        console.log(`Server is running on port ${PORT}`);
      });
}).catch((err) => 
    console.log(err)
);
