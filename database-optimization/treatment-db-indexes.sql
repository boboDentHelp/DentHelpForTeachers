-- ==========================================
-- Database Indexing Optimization for treatment_db
-- Purpose: Improve query performance for treatment operations
-- Target: <50ms query response time
-- ==========================================

USE treatment_db;

-- ==========================================
-- Treatment Sheet Table Indexes
-- ==========================================

-- Index on appointment_id for appointment-based lookups
CREATE INDEX IF NOT EXISTS idx_treatment_appointment_id
ON treatment_sheet(appointment_id);

-- Index on patient_cnp for patient treatment history
CREATE INDEX IF NOT EXISTS idx_treatment_patient_cnp
ON treatment_sheet(patient_cnp);

-- Index on treatment_date for date-based queries
CREATE INDEX IF NOT EXISTS idx_treatment_date
ON treatment_sheet(treatment_date DESC);

-- Composite index for patient treatments by date
CREATE INDEX IF NOT EXISTS idx_treatment_patient_date
ON treatment_sheet(patient_cnp, treatment_date DESC);

-- Index on created_at for temporal sorting
CREATE INDEX IF NOT EXISTS idx_treatment_created
ON treatment_sheet(created_at DESC);

-- ==========================================
-- Medical Report Table Indexes
-- ==========================================

-- Index on patient_cnp for patient medical reports
CREATE INDEX IF NOT EXISTS idx_report_patient_cnp
ON medical_report(patient_cnp);

-- Index on report_date for date-based queries
CREATE INDEX IF NOT EXISTS idx_report_date
ON medical_report(report_date DESC);

-- Composite index for patient reports by date
CREATE INDEX IF NOT EXISTS idx_report_patient_date
ON medical_report(patient_cnp, report_date DESC);

-- Index on report_type for filtering by type
CREATE INDEX IF NOT EXISTS idx_report_type
ON medical_report(report_type);

-- ==========================================
-- Medication Table Indexes
-- ==========================================

-- Index on treatment_sheet_id for treatment medications
CREATE INDEX IF NOT EXISTS idx_medication_treatment
ON medication(treatment_sheet_id);

-- Index on medication_name for medication lookups
CREATE INDEX IF NOT EXISTS idx_medication_name
ON medication(medication_name);

-- Composite index for treatment medications
CREATE INDEX IF NOT EXISTS idx_medication_treatment_name
ON medication(treatment_sheet_id, medication_name);

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
WHERE TABLE_SCHEMA = 'treatment_db'
ORDER BY TABLE_NAME, INDEX_NAME, SEQ_IN_INDEX;

-- ==========================================
-- Optimization Complete
-- ==========================================
SELECT 'Treatment DB indexing complete!' AS status;
