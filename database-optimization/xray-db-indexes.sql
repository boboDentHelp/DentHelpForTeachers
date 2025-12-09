-- ==========================================
-- Database Indexing Optimization for xray_db
-- Purpose: Improve query performance for X-ray operations
-- Target: <50ms query response time
-- ==========================================

USE xray_db;

-- ==========================================
-- X-Ray Table Indexes
-- ==========================================

-- Index on patient_cnp for patient X-ray lookups
CREATE INDEX IF NOT EXISTS idx_xray_patient_cnp
ON xray(patient_cnp);

-- Index on upload_date for date-based queries
CREATE INDEX IF NOT EXISTS idx_xray_upload_date
ON xray(upload_date DESC);

-- Composite index for patient X-rays by date (most common query)
CREATE INDEX IF NOT EXISTS idx_xray_patient_date
ON xray(patient_cnp, upload_date DESC);

-- Index on xray_type for filtering by type
CREATE INDEX IF NOT EXISTS idx_xray_type
ON xray(xray_type);

-- Index on tooth_number for tooth-specific X-rays
CREATE INDEX IF NOT EXISTS idx_xray_tooth_number
ON xray(tooth_number);

-- Composite index for patient tooth X-rays
CREATE INDEX IF NOT EXISTS idx_xray_patient_tooth
ON xray(patient_cnp, tooth_number);

-- Index on file_url for direct file access
CREATE INDEX IF NOT EXISTS idx_xray_file_url
ON xray(file_url(255));

-- Index on created_at for temporal sorting
CREATE INDEX IF NOT EXISTS idx_xray_created
ON xray(created_at DESC);

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
WHERE TABLE_SCHEMA = 'xray_db'
ORDER BY TABLE_NAME, INDEX_NAME, SEQ_IN_INDEX;

-- ==========================================
-- Optimization Complete
-- ==========================================
SELECT 'X-Ray DB indexing complete!' AS status;
