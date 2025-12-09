-- ==========================================
-- Database Indexing Optimization for notification_db
-- Purpose: Improve query performance for notification operations
-- Target: <50ms query response time
-- ==========================================

USE notification_db;

-- ==========================================
-- Notification Table Indexes
-- ==========================================

-- Index on recipient_email for user notification lookups
CREATE INDEX IF NOT EXISTS idx_notification_recipient
ON notification(recipient_email);

-- Index on notification_type for filtering by type
CREATE INDEX IF NOT EXISTS idx_notification_type
ON notification(notification_type);

-- Index on status for filtering by status
CREATE INDEX IF NOT EXISTS idx_notification_status
ON notification(status);

-- Composite index for user notifications by status
CREATE INDEX IF NOT EXISTS idx_notification_recipient_status
ON notification(recipient_email, status);

-- Index on sent_at for temporal queries
CREATE INDEX IF NOT EXISTS idx_notification_sent_at
ON notification(sent_at DESC);

-- Composite index for user notifications by date
CREATE INDEX IF NOT EXISTS idx_notification_recipient_date
ON notification(recipient_email, sent_at DESC);

-- Index on appointment_id for appointment notifications
CREATE INDEX IF NOT EXISTS idx_notification_appointment
ON notification(appointment_id);

-- Index on created_at for temporal sorting
CREATE INDEX IF NOT EXISTS idx_notification_created
ON notification(created_at DESC);

-- Composite index for pending notifications
CREATE INDEX IF NOT EXISTS idx_notification_pending
ON notification(status, created_at DESC);

-- ==========================================
-- Email Log Table Indexes (if exists)
-- ==========================================

CREATE TABLE IF NOT EXISTS email_log (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    recipient_email VARCHAR(100) NOT NULL,
    subject VARCHAR(255),
    status VARCHAR(50),
    error_message TEXT,
    sent_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email_log_recipient (recipient_email),
    INDEX idx_email_log_status (status),
    INDEX idx_email_log_sent_at (sent_at DESC)
);

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
WHERE TABLE_SCHEMA = 'notification_db'
ORDER BY TABLE_NAME, INDEX_NAME, SEQ_IN_INDEX;

-- ==========================================
-- Optimization Complete
-- ==========================================
SELECT 'Notification DB indexing complete!' AS status;
