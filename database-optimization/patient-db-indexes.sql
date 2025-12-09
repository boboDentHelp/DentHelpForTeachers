-- ==========================================
-- Database Indexing Optimization for patient_db
-- Purpose: Improve query performance for patient operations
-- Target: <50ms query response time
-- ==========================================

USE patient_db;

-- ==========================================
-- Personal Data Table Indexes
-- ==========================================

-- Index on CNP (primary patient identifier)
CREATE INDEX IF NOT EXISTS idx_personal_data_cnp
ON personal_data(cnp);

-- Index on phone number for contact lookups
CREATE INDEX IF NOT EXISTS idx_personal_data_phone
ON personal_data(phone_number);

-- Index on created_at for temporal queries
CREATE INDEX IF NOT EXISTS idx_personal_data_created
ON personal_data(created_at DESC);

-- ==========================================
-- General Anamnesis Table Indexes
-- ==========================================

-- Index on CNP for patient medical history lookups
CREATE INDEX IF NOT EXISTS idx_anamnesis_cnp
ON general_anamnesis(cnp);

-- Index on updated_at for recent changes tracking
CREATE INDEX IF NOT EXISTS idx_anamnesis_updated
ON general_anamnesis(updated_at DESC);

-- ==========================================
-- Clinic Info Table Indexes
-- ==========================================

-- Index on is_active for filtering active clinics
CREATE INDEX IF NOT EXISTS idx_clinic_active
ON clinic_info(is_active);

-- Index on address_city for location-based queries
CREATE INDEX IF NOT EXISTS idx_clinic_city
ON clinic_info(address_city);

-- Index on email for clinic contact lookups
CREATE INDEX IF NOT EXISTS idx_clinic_email
ON clinic_info(email);

-- Composite index for active clinics in a city
CREATE INDEX IF NOT EXISTS idx_clinic_active_city
ON clinic_info(is_active, address_city);

-- ==========================================
-- Clinic Services Table Indexes
-- ==========================================

-- Index on clinic_id for service lookups by clinic
CREATE INDEX IF NOT EXISTS idx_services_clinic
ON clinic_services(clinic_id);

-- Index on category for filtering services by type
CREATE INDEX IF NOT EXISTS idx_services_category
ON clinic_services(category);

-- Index on is_active for filtering active services
CREATE INDEX IF NOT EXISTS idx_services_active
ON clinic_services(is_active);

-- Composite index for active services by clinic
CREATE INDEX IF NOT EXISTS idx_services_clinic_active
ON clinic_services(clinic_id, is_active);

-- Index on price for price-based sorting/filtering
CREATE INDEX IF NOT EXISTS idx_services_price
ON clinic_services(price);

-- ==========================================
-- Query Performance Analysis
-- ==========================================

-- Show all indexes
SELECT
    TABLE_NAME,
    INDEX_NAME,
    COLUMN_NAME,
    SEQ_IN_INDEX,
    CARDINALITY
FROM INFORMATION_SCHEMA.STATISTICS
WHERE TABLE_SCHEMA = 'patient_db'
ORDER BY TABLE_NAME, INDEX_NAME, SEQ_IN_INDEX;

-- ==========================================
-- Optimization Complete
-- ==========================================
SELECT 'Patient DB indexing complete!' AS status;
