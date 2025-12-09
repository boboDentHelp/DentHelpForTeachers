-- ==========================================
-- Database Indexing Optimization for appointment_db
-- Purpose: Improve query performance for appointment operations
-- Target: <50ms query response time
-- ==========================================

USE appointment_db;

-- ==========================================
-- Appointment Table Indexes
-- ==========================================

-- Index on patient_cnp for patient appointment lookups
CREATE INDEX IF NOT EXISTS idx_appointment_patient_cnp
ON appointment(patient_cnp);

-- Index on appointment_date for date-based queries
CREATE INDEX IF NOT EXISTS idx_appointment_date
ON appointment(appointment_date);

-- Index on status for filtering appointments by status
CREATE INDEX IF NOT EXISTS idx_appointment_status
ON appointment(status);

-- Composite index for patient appointments by date
CREATE INDEX IF NOT EXISTS idx_appointment_patient_date
ON appointment(patient_cnp, appointment_date DESC);

-- Composite index for appointments by date and status
CREATE INDEX IF NOT EXISTS idx_appointment_date_status
ON appointment(appointment_date, status);

-- Index on created_at for temporal queries
CREATE INDEX IF NOT EXISTS idx_appointment_created
ON appointment(created_at DESC);

-- ==========================================
-- Appointment Request Table Indexes
-- ==========================================

-- Index on patient_cnp for patient request lookups
CREATE INDEX IF NOT EXISTS idx_request_patient_cnp
ON appointment_request(patient_cnp);

-- Index on status for filtering requests by status
CREATE INDEX IF NOT EXISTS idx_request_status
ON appointment_request(status);

-- Index on requested_date for date-based queries
CREATE INDEX IF NOT EXISTS idx_request_requested_date
ON appointment_request(requested_date);

-- Composite index for patient requests by status
CREATE INDEX IF NOT EXISTS idx_request_patient_status
ON appointment_request(patient_cnp, status);

-- Index on created_at for temporal sorting
CREATE INDEX IF NOT EXISTS idx_request_created
ON appointment_request(created_at DESC);

-- ==========================================
-- Query Performance Analysis
-- ==========================================

SELECT
    TABLE_NAME,
    INDEX_NAME,
    COLUMN_NAME,
    SEQ_IN_INDEX,
    CARDINALITY
FROM INFORMATION_SCHEMA.STATISTICS
WHERE TABLE_SCHEMA = 'appointment_db'
ORDER BY TABLE_NAME, INDEX_NAME, SEQ_IN_INDEX;

-- ==========================================
-- Optimization Complete
-- ==========================================
SELECT 'Appointment DB indexing complete!' AS status;
