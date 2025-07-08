#!/bin/bash

# Wait for Kafka to be ready
echo "Waiting for Kafka to be ready..."
cub kafka-ready -b kafka:9092 1 20

# Create topics
echo "Creating Kafka topics..."
kafka-topics --bootstrap-server kafka:9092 --create --if-not-exists --topic validate-doctor --partitions 1 --replication-factor 1
kafka-topics --bootstrap-server kafka:9092 --create --if-not-exists --topic validate-patient --partitions 1 --replication-factor 1
kafka-topics --bootstrap-server kafka:9092 --create --if-not-exists --topic doctor-service-validator --partitions 1 --replication-factor 1
kafka-topics --bootstrap-server kafka:9092 --create --if-not-exists --topic patient-service-validator --partitions 1 --replication-factor 1

echo "Kafka topics created."
