#!/bin/bash

echo "Checking if all services are registered with Eureka..."

EUREKA_URL="http://localhost:8761/eureka/apps"
REQUIRED_SERVICES=("AUTH-SERVICE" "PATIENT-SERVICE" "APPOINTMENT-SERVICE" "TREATMENT-SERVICE" "DENTAL-RECORDS-SERVICE" "XRAY-SERVICE" "NOTIFICATION-SERVICE")

MAX_WAIT=300  # 5 minutes
ELAPSED=0
CHECK_INTERVAL=5

while [ $ELAPSED -lt $MAX_WAIT ]; do
    echo "⏳ Checking services... ($ELAPSED seconds elapsed)"

    ALL_REGISTERED=true

    for service in "${REQUIRED_SERVICES[@]}"; do
        if ! curl -s "$EUREKA_URL" | grep -q "<name>$service</name>"; then
            echo "   ❌ $service not registered yet"
            ALL_REGISTERED=false
        else
            echo "   ✅ $service registered"
        fi
    done

    if [ "$ALL_REGISTERED" = true ]; then
        echo ""
        echo "🎉 All services are registered and ready!"
        echo "✅ You can now use the frontend at http://localhost:5173"
        exit 0
    fi

    echo ""
    sleep $CHECK_INTERVAL
    ELAPSED=$((ELAPSED + CHECK_INTERVAL))
done

echo "⚠️  Timeout: Not all services registered after $MAX_WAIT seconds"
echo "Please check the logs for errors."
exit 1
