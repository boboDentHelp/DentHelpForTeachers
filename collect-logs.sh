#!/bin/bash
echo "Collecting logs from all services..."

docker-compose logs eureka-server > logs-eureka.txt 2>&1
docker-compose logs api-gateway > logs-api-gateway.txt 2>&1
docker-compose logs auth-service > logs-auth.txt 2>&1
docker-compose logs patient-service > logs-patient.txt 2>&1
docker-compose logs appointment-service > logs-appointment.txt 2>&1
docker-compose logs notification-service > logs-notification.txt 2>&1
docker-compose logs dental-records-service > logs-dental-records.txt 2>&1
docker-compose logs xray-service > logs-xray.txt 2>&1
docker-compose logs treatment-service > logs-treatment.txt 2>&1
docker-compose logs rabbitmq > logs-rabbitmq.txt 2>&1

echo ""
echo "Logs saved! Files created:"
ls -lh logs-*.txt

echo ""
echo "Searching for ERRORS..."
grep -i "error\|exception\|failed\|refused" logs-*.txt | head -50
