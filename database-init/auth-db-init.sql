-- ==========================================
-- Auto-initialization script for auth_db
-- Creates default user accounts for testing
-- ==========================================

USE auth_db;

-- Wait for table creation by Hibernate/JPA
-- This script runs after database is created but tables might not exist yet
-- We'll create a simple check

-- ==========================================
-- Create patient table if not exists
-- (JPA should create it, but just in case)
-- ==========================================
CREATE TABLE IF NOT EXISTS patient (
    cnp VARCHAR(13) PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    user_role ENUM('PATIENT', 'ADMIN', 'RADIOLOGIST') DEFAULT 'PATIENT',
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ==========================================
-- Insert Default Accounts
-- Password for all accounts: "password123"
-- BCrypt hash: $2a$10$PXmYY568x8hWjAFD0ZwysOsW6CQZJy2SGc8gpbXCMPUiFvA6MmJ4a
-- ==========================================

-- 1. ADMIN Account (Doctor/Dentist)
INSERT IGNORE INTO patient (
    cnp,
    first_name,
    last_name,
    email,
    password,
    user_role,
    is_verified
) VALUES (
    '1850515123456',
    'Dr. John',
    'Smith',
    'admin@denthelp.ro',
    '$2a$10$PXmYY568x8hWjAFD0ZwysOsW6CQZJy2SGc8gpbXCMPUiFvA6MmJ4a',
    'ADMIN',
    TRUE
);

-- 2. RADIOLOGIST Account
INSERT IGNORE INTO patient (
    cnp,
    first_name,
    last_name,
    email,
    password,
    user_role,
    is_verified
) VALUES (
    '1750315123456',
    'Maria',
    'Johnson',
    'radiologist@denthelp.ro',
    '$2a$10$PXmYY568x8hWjAFD0ZwysOsW6CQZJy2SGc8gpbXCMPUiFvA6MmJ4a',
    'RADIOLOGIST',
    TRUE
);

-- 3. Test PATIENT Account
INSERT IGNORE INTO patient (
    cnp,
    first_name,
    last_name,
    email,
    password,
    user_role,
    is_verified
) VALUES (
    '2950101123456',
    'Jane',
    'Doe',
    'patient@denthelp.ro',
    '$2a$10$PXmYY568x8hWjAFD0ZwysOsW6CQZJy2SGc8gpbXCMPUiFvA6MmJ4a',
    'PATIENT',
    TRUE
);

-- 4. Second Test PATIENT Account
INSERT IGNORE INTO patient (
    cnp,
    first_name,
    last_name,
    email,
    password,
    user_role,
    is_verified
) VALUES (
    '2850515123789',
    'Michael',
    'Brown',
    'test@denthelp.ro',
    '$2a$10$PXmYY568x8hWjAFD0ZwysOsW6CQZJy2SGc8gpbXCMPUiFvA6MmJ4a',
    'PATIENT',
    TRUE
);

-- ==========================================
-- Verification
-- ==========================================
SELECT 'Auth database initialization complete!' AS status;
SELECT COUNT(*) AS total_accounts FROM patient;
SELECT user_role, COUNT(*) AS count FROM patient GROUP BY user_role;

-- ==========================================
-- Display Created Accounts (for logs)
-- ==========================================
SELECT
    CONCAT(first_name, ' ', last_name) AS name,
    email,
    user_role,
    cnp
FROM patient
ORDER BY user_role, last_name;
