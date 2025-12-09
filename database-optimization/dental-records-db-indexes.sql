-- ==========================================
-- Database Indexing Optimization for dental_records_db
-- Purpose: Improve query performance for dental records operations
-- Target: <50ms query response time
-- ==========================================

USE dental_records_db;

-- ==========================================
-- Tooth Intervention Table Indexes
-- ==========================================

-- Index on patient_cnp for patient dental history lookups
CREATE INDEX IF NOT EXISTS idx_intervention_patient_cnp
ON tooth_intervention(patient_cnp);

-- Index on tooth_number for tooth-specific history
CREATE INDEX IF NOT EXISTS idx_intervention_tooth_number
ON tooth_intervention(tooth_number);

-- Composite index for patient tooth history (most common query)
CREATE INDEX IF NOT EXISTS idx_intervention_patient_tooth
ON tooth_intervention(patient_cnp, tooth_number);

-- Index on intervention_date for temporal queries
CREATE INDEX IF NOT EXISTS idx_intervention_date
ON tooth_intervention(intervention_date DESC);

-- Index on intervention_type for filtering by type
CREATE INDEX IF NOT EXISTS idx_intervention_type
ON tooth_intervention(intervention_type);

-- Composite index for patient interventions by date
CREATE INDEX IF NOT EXISTS idx_intervention_patient_date
ON tooth_intervention(patient_cnp, intervention_date DESC);

-- ==========================================
-- Tooth Problem Table Indexes
-- ==========================================

-- Index on patient_cnp for patient problem lookups
CREATE INDEX IF NOT EXISTS idx_problem_patient_cnp
ON tooth_problem(patient_cnp);

-- Index on tooth_number for tooth-specific problems
CREATE INDEX IF NOT EXISTS idx_problem_tooth_number
ON tooth_problem(tooth_number);

-- Composite index for patient tooth problems (most common query)
CREATE INDEX IF NOT EXISTS idx_problem_patient_tooth
ON tooth_problem(patient_cnp, tooth_number);

-- Index on problem_type for filtering by problem type
CREATE INDEX IF NOT EXISTS idx_problem_type
ON tooth_problem(problem_type);

-- Index on severity for filtering critical problems
CREATE INDEX IF NOT EXISTS idx_problem_severity
ON tooth_problem(severity);

-- Index on is_resolved for filtering active problems
CREATE INDEX IF NOT EXISTS idx_problem_resolved
ON tooth_problem(is_resolved);

-- Composite index for active problems by patient
CREATE INDEX IF NOT EXISTS idx_problem_patient_active
ON tooth_problem(patient_cnp, is_resolved);

-- Index on created_at for temporal queries
CREATE INDEX IF NOT EXISTS idx_problem_created
ON tooth_problem(created_at DESC);

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
WHERE TABLE_SCHEMA = 'dental_records_db'
ORDER BY TABLE_NAME, INDEX_NAME, SEQ_IN_INDEX;

-- ==========================================
-- Optimization Complete
-- ==========================================
SELECT 'Dental Records DB indexing complete!' AS status;
