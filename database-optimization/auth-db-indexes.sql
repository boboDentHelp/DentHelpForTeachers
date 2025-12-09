-- ==========================================
-- Database Indexing Optimization for auth_db
-- Purpose: Improve query performance for authentication operations
-- Target: <50ms query response time
-- ==========================================

USE auth_db;

-- ==========================================
-- Patient Table Indexes
-- ==========================================

-- Index on email for login queries
-- Used by: Login operations (WHERE email = ?)
CREATE INDEX IF NOT EXISTS idx_patient_email
ON patient(email);

-- Index on CNP for patient lookups
-- Used by: Patient data retrieval (WHERE cnp = ?)
CREATE INDEX IF NOT EXISTS idx_patient_cnp
ON patient(cnp);

-- Index on user_role for role-based queries
-- Used by: Admin user listing, role-based filtering
CREATE INDEX IF NOT EXISTS idx_patient_user_role
ON patient(user_role);

-- Index on is_verified for filtering verified users
-- Used by: Email verification status checks
CREATE INDEX IF NOT EXISTS idx_patient_is_verified
ON patient(is_verified);

-- Composite index for common query patterns
-- Used by: Login with email and verification check
CREATE INDEX IF NOT EXISTS idx_patient_email_verified
ON patient(email, is_verified);

-- Index on created_at for temporal queries
-- Used by: User registration analytics, sorting
CREATE INDEX IF NOT EXISTS idx_patient_created_at
ON patient(created_at DESC);

-- ==========================================
-- Verification Code Table Indexes (if exists)
-- ==========================================

-- Note: These will be created if verification_code table exists
CREATE TABLE IF NOT EXISTS verification_code (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(100) NOT NULL,
    code VARCHAR(6) NOT NULL,
    expiry_time TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_verification_email (email),
    INDEX idx_verification_code (code),
    INDEX idx_verification_expiry (expiry_time)
);

-- ==========================================
-- Password Reset Table Indexes (if exists)
-- ==========================================

CREATE TABLE IF NOT EXISTS password_reset_token (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(100) NOT NULL,
    token VARCHAR(255) NOT NULL,
    expiry_time TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_reset_token (token),
    INDEX idx_reset_email (email),
    INDEX idx_reset_expiry (expiry_time)
);

-- ==========================================
-- Query Performance Analysis
-- ==========================================

-- Show all indexes on patient table
SELECT
    TABLE_NAME,
    INDEX_NAME,
    COLUMN_NAME,
    SEQ_IN_INDEX,
    CARDINALITY
FROM INFORMATION_SCHEMA.STATISTICS
WHERE TABLE_SCHEMA = 'auth_db'
    AND TABLE_NAME = 'patient'
ORDER BY TABLE_NAME, INDEX_NAME, SEQ_IN_INDEX;

-- ==========================================
-- Optimization Complete
-- ==========================================
SELECT 'Auth DB indexing complete!' AS status;
