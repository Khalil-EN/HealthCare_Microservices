#!/bin/sh

echo "Waiting for MongoDB to be ready..."

until nc -z -v -w30 mongo 27017
do
  echo "Waiting for MongoDB connection..."
  sleep 2
done

echo "MongoDB is up - starting the service."

until nc -z kafka 9092; do
  echo "Waiting for Kafka connection..."
  sleep 2
done
echo "Kafka is up - continuing..."

exec "$@"
