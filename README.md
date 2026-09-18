# Healthcare Microservices

A containerized healthcare management application built using a **microservices architecture**, **Docker Compose**, **Node.js**, **React**, **MongoDB**, **Apache Kafka**, and **Consul**.

The application provides a web interface for managing **patients, doctors, and appointments**. Each domain is implemented as an independent backend microservice, while an API Gateway provides a single entry point for the frontend.

This project focuses on the fundamentals of distributed systems and microservices, including **service separation, service discovery, synchronous REST communication, asynchronous messaging, and containerized deployment**.

---

## Architecture

```text
                         ┌─────────────────────┐
                         │    React Frontend    │
                         └──────────┬──────────┘
                                    │
                                    │ HTTP
                                    ▼
                         ┌─────────────────────┐
                         │     API Gateway     │
                         │     Express.js      │
                         │      :5000          │
                         └──────────┬──────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
                    ▼               ▼               ▼
             ┌────────────┐  ┌────────────┐  ┌──────────────┐
             │  Patient   │  │   Doctor   │  │ Appointment  │
             │  Service   │  │  Service   │  │   Service    │
             │   :4002    │  │   :4000    │  │    :4001     │
             └─────┬──────┘  └─────┬──────┘  └──────┬───────┘
                   │                │                 │
                   ▼                ▼                 ▼
             ┌──────────┐     ┌──────────┐      ┌───────────┐
             │ Patient  │     │  Doctor  │      │Appointment│
             │ Database │     │ Database │      │ Database  │
             └──────────┘     └──────────┘      └───────────┘
                    \               │               /
                     \              │              /
                      └─────────────┼─────────────┘
                                    │
                              ┌─────▼─────┐
                              │   Kafka   │
                              │ + ZooKeeper│
                              └───────────┘

                         ┌──────────────┐
                         │    Consul    │
                         │Service       │
                         │Discovery     │
                         └──────────────┘

                    All components run with
                       Docker Compose
```

---

## Features

### Healthcare Management

The application provides CRUD operations for:

* **Patients**
* **Doctors**
* **Appointments**

The React frontend provides interfaces to:

* View patients, doctors, and appointments
* View individual details
* Create new records
* Update existing records
* Delete records

### Microservices

The backend is divided into three independent business services:

| Service             | Responsibility         |   Port |
| ------------------- | ---------------------- | -----: |
| Patient Service     | Patient management     | `4002` |
| Doctor Service      | Doctor management      | `4000` |
| Appointment Service | Appointment management | `4001` |

An **API Gateway** runs on port `5000` and acts as the entry point for frontend requests.

### API Gateway

The frontend communicates with the API Gateway instead of directly accessing the backend services.

```text
React Frontend
      │
      ▼
 API Gateway :5000
      │
      ├──► Patient Service :4002
      ├──► Doctor Service :4000
      └──► Appointment Service :4001
```

The gateway uses **Consul service discovery** to dynamically locate the backend services.

### Service Discovery with Consul

Each backend service registers itself with Consul and exposes a health endpoint.

```text
Patient Service ─────┐
Doctor Service ──────┼──► Consul
Appointment Service ─┘
```

The API Gateway queries Consul to retrieve the address and port of the appropriate service instead of relying entirely on hard-coded service locations.

### Asynchronous Communication with Kafka

**Apache Kafka** is used for asynchronous communication between the microservices.

Kafka topics are automatically initialized when the Docker Compose environment starts.

The project defines topics including:

```text
validate-doctor
validate-patient
doctor-service-validator
patient-service-validator
```

The Appointment Service uses Kafka-based validation to communicate with the Patient and Doctor services when processing appointments.

### Independent Databases

MongoDB is used as the persistence layer.

Each business service has its own database:

```text
patientDB
doctorDB
appointmentDB
```

This keeps the data associated with each service separated.

---

## Technology Stack

### Frontend

* React 19
* React Router
* Axios
* CSS

### Backend

* Node.js
* Express.js
* Mongoose
* Axios
* KafkaJS
* Consul

### Database

* MongoDB

### Messaging

* Apache Kafka
* ZooKeeper

### Containerization

* Docker
* Docker Compose

---

## Project Structure

```text
HealthCare_Microservices/
│
├── apigateaway/
│   ├── Dockerfile
│   ├── gateaway.js
│   ├── package.json
│   └── package-lock.json
│
├── appointmentservice/
│   ├── Controllers/
│   │   └── appointmentController.js
│   ├── kafka/
│   │   ├── kafkaClient.js
│   │   └── validators.js
│   ├── Model/
│   │   └── Appointment.js
│   ├── Dockerfile
│   ├── server.js
│   ├── wait-for-mongo.sh
│   └── package.json
│
├── doctorservice/
│   ├── Controller/
│   │   └── doctorController.js
│   ├── kafka/
│   │   ├── consumer.js
│   │   └── kafkaClient.js
│   ├── Model/
│   │   └── Doctor.js
│   ├── Dockerfile
│   ├── server.js
│   ├── wait-for-mongo.sh
│   └── package.json
│
├── patientservice/
│   ├── Controllers/
│   │   └── patientController.js
│   ├── kafka/
│   │   ├── consumer.js
│   │   └── kafkaClient.js
│   ├── Models/
│   │   └── Patient.js
│   ├── Dockerfile
│   ├── server.js
│   ├── wait-for-mongo.sh
│   └── package.json
│
├── microservices-frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Appointments/
│   │   │   ├── Doctors/
│   │   │   └── Patients/
│   │   └── services/
│   │       ├── appointmentService.js
│   │       ├── doctorService.js
│   │       └── patientService.js
│   └── package.json
│
├── create-topics.sh
├── docker-compose.yml
├── run-with-cleanup.ps1
└── README.md
```

---

## Prerequisites

Install the following:

* [Docker Desktop](https://www.docker.com/products/docker-desktop/)
* Docker Compose
* Git

Verify the installation:

```powershell
docker --version
docker compose version
```

---

## Running the Application

Clone the repository:

```powershell
git clone <repository-url>
cd HealthCare_Microservices
```

Start the complete application with Docker Compose:

```powershell
docker compose up --build
```

Or run it in detached mode:

```powershell
docker compose up --build -d
```

Docker Compose starts:

* React frontend
* API Gateway
* Patient Service
* Doctor Service
* Appointment Service
* MongoDB
* Kafka
* ZooKeeper
* Consul
* Kafka topic initialization

The individual services wait for MongoDB before starting their application servers.

---

## Application Access

Once the containers are running, the React frontend is available at:

```text
http://localhost:3000
```

The API Gateway is available at:

```text
http://localhost:5000
```

Consul's web interface is available at:

```text
http://localhost:8500
```

MongoDB is exposed on:

```text
localhost:27017
```

Kafka is exposed on:

```text
localhost:9092
```

---

## API Endpoints

The API Gateway exposes the following endpoints.

### Patients

```text
GET    /patients
GET    /patients/:id
POST   /patients
PUT    /patients/update/:id
DELETE /patients/delete/:id
```

### Doctors

```text
GET    /doctors
GET    /doctors/:id
POST   /doctors
PUT    /doctors/update/:id
DELETE /doctors/delete/:id
```

### Appointments

```text
GET    /appointments
GET    /appointments/:id
POST   /appointments
PUT    /appointments/update/:id
DELETE /appointments/delete/:id
```

The frontend uses these APIs through the API Gateway.

---

## Docker Compose Services

The `docker-compose.yml` file defines the complete local environment:

| Container            | Purpose                    |
| -------------------- | -------------------------- |
| `mongo`              | MongoDB database           |
| `zookeeper`          | Kafka coordination         |
| `kafka`              | Message broker             |
| `consul`             | Service discovery          |
| `patientservice`     | Patient management         |
| `doctorservice`      | Doctor management          |
| `appointmentservice` | Appointment management     |
| `apigateway`         | API routing                |
| `topic-init`         | Kafka topic initialization |

This allows the complete distributed application to be launched using a single Docker Compose command.

---

## Stopping the Application

Stop the running containers:

```powershell
docker compose down
```

To also remove the MongoDB data volume, if one has been created:

```powershell
docker compose down -v
```

To inspect running containers:

```powershell
docker compose ps
```

To view logs:

```powershell
docker compose logs
```

Or for a specific service:

```powershell
docker compose logs patientservice
```

---

## Development

Each backend service is an independent Node.js application.

For example, to run the Patient Service locally:

```powershell
cd patientservice
npm install
npm start
```

The same approach can be used for the Doctor and Appointment services.

The frontend can be run independently with:

```powershell
cd microservices-frontend
npm install
npm start
```

However, when running services individually, their dependencies such as MongoDB, Kafka, and Consul must also be available.

For the easiest setup, use Docker Compose.

---

## Design Principles

This project was designed around the following microservices principles:

* **Separation of concerns:** Each business domain is implemented as an independent service.
* **Loose coupling:** Services communicate through well-defined APIs and Kafka messages.
* **Service discovery:** Consul allows services to locate one another dynamically.
* **API Gateway pattern:** The frontend interacts with a single backend entry point.
* **Asynchronous communication:** Kafka enables event-driven communication between services.
* **Database separation:** Each business service uses its own MongoDB database.
* **Containerization:** Docker provides isolated and reproducible service environments.
* **Orchestration of local infrastructure:** Docker Compose manages the complete local environment.

---

## Future Improvements

This project provides the foundation for evolving the application into a more complete cloud-native platform.

* **Kubernetes:** Replace Docker Compose with Kubernetes for container orchestration and scalability.
* **Observability:** Add Prometheus/Grafana for metrics, Loki for centralized logging, and OpenTelemetry/Jaeger for distributed tracing.
* **CI/CD:** Introduce automated testing, Docker image builds, and deployment pipelines using GitHub Actions.
* **GitOps:** Integrate a GitOps workflow with tools such as Argo CD.
* **Service Mesh:** Introduce a service mesh for service-to-service traffic management, security, and observability.
* **Cloud Deployment:** Deploy the application to a managed Kubernetes platform such as AWS EKS, Azure AKS, or Google GKE.
* **Security & Resilience:** Add authentication, authorization, HTTPS/TLS, secrets management, retries, and circuit breakers.

---

## Project Evolution

This repository represents the **Docker Compose version** of the project and serves as the foundation for a more advanced cloud-native implementation.

```text
Docker Compose Version
        │
        ├── React Frontend
        ├── API Gateway
        ├── Patient Service
        ├── Doctor Service
        ├── Appointment Service
        ├── MongoDB
        ├── Kafka + ZooKeeper
        └── Consul
                │
                ▼
      Future Cloud-Native Version
                │
        ├── Kubernetes
        ├── Observability
        ├── CI/CD
        ├── GitOps
        ├── Service Mesh
        └── Cloud Deployment
```

---

