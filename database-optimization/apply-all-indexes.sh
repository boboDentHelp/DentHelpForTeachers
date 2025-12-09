#!/bin/bash

# ==========================================
# Apply All Database Indexes
# Purpose: Apply performance indexes to all databases
# ==========================================

set -e

echo "=================================="
echo "Database Indexing Optimization"
echo "=================================="

# Wait for databases to be ready
echo "Waiting for databases to be ready..."
sleep 5

# Apply auth-db indexes
echo ""
echo "Applying auth-db indexes..."
docker exec -i auth-db mysql -uroot -proot < /database-optimization/auth-db-indexes.sql

# Apply patient-db indexes
echo ""
echo "Applying patient-db indexes..."
docker exec -i patient-db mysql -uroot -proot < /database-optimization/patient-db-indexes.sql

# Apply appointment-db indexes
echo ""
echo "Applying appointment-db indexes..."
docker exec -i appointment-db mysql -uroot -proot < /database-optimization/appointment-db-indexes.sql

# Apply dental-records-db indexes
echo ""
echo "Applying dental-records-db indexes..."
docker exec -i dental-records-db mysql -uroot -proot < /database-optimization/dental-records-db-indexes.sql

# Apply xray-db indexes
echo ""
echo "Applying xray-db indexes..."
docker exec -i xray-db mysql -uroot -proot < /database-optimization/xray-db-indexes.sql

# Apply treatment-db indexes
echo ""
echo "Applying treatment-db indexes..."
docker exec -i treatment-db mysql -uroot -proot < /database-optimization/treatment-db-indexes.sql

# Apply notification-db indexes
echo ""
echo "Applying notification-db indexes..."
docker exec -i notification-db mysql -uroot -proot < /database-optimization/notification-db-indexes.sql

echo ""
echo "=================================="
echo "All database indexes applied successfully!"
echo "=================================="
echo ""
echo "Performance improvements:"
echo "  - Email lookups: optimized for <50ms"
echo "  - Patient queries: indexed on CNP and key fields"
echo "  - Appointment queries: indexed on date and status"
echo "  - Dental records: indexed on patient and tooth number"
echo "  - X-ray queries: indexed on patient and upload date"
echo "  - Treatment queries: indexed on appointment and patient"
echo "  - Notification queries: indexed on recipient and status"
echo ""
