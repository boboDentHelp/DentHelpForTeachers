# Database Optimization

This directory contains database indexing scripts for optimizing query performance across all microservices.

## Performance Requirements

- **Target Response Time**: <50ms for 95% of database queries
- **Connection Pooling**: HikariCP with max 20 connections per service
- **Query Optimization**: Strategic indexing on frequently queried columns

## Index Scripts

Each database has dedicated indexing scripts optimized for its specific query patterns:

### 1. `auth-db-indexes.sql`
Optimizes authentication and user management queries:
- Email-based login queries
- CNP lookups for user identification
- Role-based filtering
- Email verification status checks
- User registration analytics

### 2. `patient-db-indexes.sql`
Optimizes patient data and clinic information queries:
- Patient personal data lookups
- General anamnesis (medical history) queries
- Clinic information searches
- Clinic services filtering
- Location-based clinic queries

### 3. `appointment-db-indexes.sql`
Optimizes appointment scheduling queries:
- Patient appointment history
- Date-based appointment queries
- Appointment status filtering
- Appointment request management
- Temporal sorting and filtering

### 4. `dental-records-db-indexes.sql`
Optimizes dental intervention and problem tracking:
- Patient dental history by tooth number
- Intervention type filtering
- Active dental problems
- Severity-based problem filtering
- Temporal intervention tracking

### 5. `xray-db-indexes.sql`
Optimizes X-ray image management:
- Patient X-ray history
- Date-based X-ray queries
- X-ray type filtering
- Tooth-specific X-rays
- File URL lookups

### 6. `treatment-db-indexes.sql`
Optimizes treatment and medication tracking:
- Treatment sheets by appointment
- Patient treatment history
- Medical reports by patient
- Medication tracking per treatment
- Report type filtering

### 7. `notification-db-indexes.sql`
Optimizes notification delivery:
- User notification queries
- Notification status tracking
- Appointment-related notifications
- Email delivery logging
- Pending notification processing

## How to Apply Indexes

### Option 1: Apply All Indexes at Once

```bash
# Copy index files to container volumes first
docker cp database-optimization auth-db:/database-optimization
docker cp database-optimization patient-db:/database-optimization
docker cp database-optimization appointment-db:/database-optimization
docker cp database-optimization dental-records-db:/database-optimization
docker cp database-optimization xray-db:/database-optimization
docker cp database-optimization treatment-db:/database-optimization
docker cp database-optimization notification-db:/database-optimization

# Run the apply script
./database-optimization/apply-all-indexes.sh
```

### Option 2: Apply Indexes to Individual Databases

```bash
# Auth database
docker exec -i auth-db mysql -uroot -proot < database-optimization/auth-db-indexes.sql

# Patient database
docker exec -i patient-db mysql -uroot -proot < database-optimization/patient-db-indexes.sql

# Appointment database
docker exec -i appointment-db mysql -uroot -proot < database-optimization/appointment-db-indexes.sql

# And so on...
```

### Option 3: Apply During Container Startup

Add index scripts to docker-compose volumes:

```yaml
auth-db:
  volumes:
    - ./database-optimization/auth-db-indexes.sql:/docker-entrypoint-initdb.d/99-indexes.sql:ro
```

## Index Strategy

### Primary Indexes
- **Single-column indexes**: For frequently queried individual columns (email, CNP, status)
- **Composite indexes**: For common multi-column query patterns (patient_cnp + date)
- **Temporal indexes**: For date/time-based sorting and filtering (DESC for recent first)

### Index Types
- **B-tree indexes**: Default for most columns, optimal for equality and range queries
- **Partial indexes**: For text fields with length limits (e.g., file_url(255))

### Cardinality Considerations
- High cardinality columns (email, CNP): Excellent index candidates
- Medium cardinality columns (status, type): Good for filtering
- Low cardinality columns (boolean flags): Use composite indexes

## Performance Monitoring

After applying indexes, monitor query performance:

### Check Index Usage

```sql
-- Show all indexes for a table
SHOW INDEXES FROM patient;

-- Analyze query execution plan
EXPLAIN SELECT * FROM patient WHERE email = 'test@example.com';

-- Check index cardinality
SELECT TABLE_NAME, INDEX_NAME, CARDINALITY
FROM INFORMATION_SCHEMA.STATISTICS
WHERE TABLE_SCHEMA = 'auth_db';
```

### Measure Query Performance

```sql
-- Enable query profiling
SET profiling = 1;

-- Run your queries
SELECT * FROM patient WHERE email = 'test@example.com';

-- View query timing
SHOW PROFILES;

-- Detailed timing for last query
SHOW PROFILE FOR QUERY 1;
```

## Connection Pooling Configuration

Each service uses HikariCP with the following configuration:

```yaml
spring:
  datasource:
    hikari:
      maximum-pool-size: 20
      minimum-idle: 0
      connection-timeout: 30000
      idle-timeout: 30000
      initialization-fail-timeout: -1
```

### Pool Sizing Rationale
- **Maximum Pool Size**: 20 connections per service
- **Formula**: connections = ((core_count * 2) + effective_spindle_count)
- **Prevents**: Connection exhaustion and database overload
- **Allows**: Horizontal scaling without connection conflicts

## Query Optimization Best Practices

1. **Always Use Indexes**
   - Ensure WHERE clauses use indexed columns
   - Use composite indexes for multi-column filters

2. **Avoid N+1 Queries**
   - Use JPA fetch joins for related entities
   - Batch queries when possible

3. **Pagination**
   - Always paginate large result sets
   - Use indexed columns in ORDER BY

4. **Select Only Required Columns**
   - Avoid SELECT * in production code
   - Use DTOs for projections

5. **Connection Management**
   - Close connections properly
   - Use connection pooling
   - Set appropriate timeouts

## Verification

After applying indexes, verify improvements:

```bash
# Run load tests
cd k6
./run-load-test.sh load

# Check database metrics in Grafana
# http://localhost:3000

# Monitor query logs
docker logs patient-service | grep "Hibernate:"
```

## Expected Performance Improvements

- **Before Indexing**: 100-500ms average query time
- **After Indexing**: 10-50ms average query time
- **Improvement**: 5-10x faster queries
- **Reduced Load**: Lower CPU usage on database servers
- **Better Scalability**: Support for higher concurrent user load

## Maintenance

### When to Rebuild Indexes

```sql
-- Check index fragmentation
ANALYZE TABLE patient;

-- Rebuild indexes if needed
OPTIMIZE TABLE patient;
```

### When to Add New Indexes

- New query patterns emerge
- Slow query logs show unindexed queries
- Application adds new search features
- Performance monitoring reveals bottlenecks

## Resources

- [MySQL Index Documentation](https://dev.mysql.com/doc/refman/8.0/en/mysql-indexes.html)
- [HikariCP Configuration](https://github.com/brettwooldridge/HikariCP#configuration-knobs-baby)
- [Query Optimization Guide](https://dev.mysql.com/doc/refman/8.0/en/optimization.html)
