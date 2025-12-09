#!/bin/bash

echo "================================================"
echo "Database Initialization Script"
echo "================================================"

# Wait for databases to be ready
echo "Waiting for auth-db to be ready..."
until mysql -h auth-db -u root -proot -e "SELECT 1" >/dev/null 2>&1; do
    echo "  auth-db is unavailable - sleeping"
    sleep 2
done
echo "✓ auth-db is ready!"

echo "Waiting for patient-db to be ready..."
until mysql -h patient-db -u root -proot -e "SELECT 1" >/dev/null 2>&1; do
    echo "  patient-db is unavailable - sleeping"
    sleep 2
done
echo "✓ patient-db is ready!"

# Initialize auth database with user accounts
echo ""
echo "================================================"
echo "Initializing auth_db with default accounts..."
echo "================================================"

mysql -h auth-db -u root -proot auth_db <<-EOSQL
    -- Create patient table if not exists
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

    -- Insert default accounts (INSERT IGNORE = only if not exists)
    INSERT IGNORE INTO patient (cnp, first_name, last_name, email, password, user_role, is_verified) VALUES
    ('1850515123456', 'Dr. John', 'Smith', 'admin@denthelp.ro', '\$2a\$10\$PXmYY568x8hWjAFD0ZwysOsW6CQZJy2SGc8gpbXCMPUiFvA6MmJ4a', 'ADMIN', TRUE),
    ('1750315123456', 'Maria', 'Johnson', 'radiologist@denthelp.ro', '\$2a\$10\$PXmYY568x8hWjAFD0ZwysOsW6CQZJy2SGc8gpbXCMPUiFvA6MmJ4a', 'RADIOLOGIST', TRUE),
    ('2950101123456', 'Jane', 'Doe', 'patient@denthelp.ro', '\$2a\$10\$PXmYY568x8hWjAFD0ZwysOsW6CQZJy2SGc8gpbXCMPUiFvA6MmJ4a', 'PATIENT', TRUE),
    ('2850515123789', 'Michael', 'Brown', 'test@denthelp.ro', '\$2a\$10\$PXmYY568x8hWjAFD0ZwysOsW6CQZJy2SGc8gpbXCMPUiFvA6MmJ4a', 'PATIENT', TRUE);

    -- Verify
    SELECT '✓ Accounts initialized!' AS status;
    SELECT COUNT(*) AS total_accounts FROM patient;
    SELECT user_role, COUNT(*) AS count FROM patient GROUP BY user_role;
EOSQL

echo "✓ auth_db initialization complete!"

# Initialize patient database with clinic info
echo ""
echo "================================================"
echo "Initializing patient_db with clinic data..."
echo "================================================"

mysql -h patient-db -u root -proot patient_db <<-EOSQL
    -- Create clinic_info table if not exists
    CREATE TABLE IF NOT EXISTS clinic_info (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        address_street VARCHAR(255),
        address_number VARCHAR(50),
        address_city VARCHAR(100),
        address_country VARCHAR(100) DEFAULT 'Romania',
        postal_code VARCHAR(20),
        phone_primary VARCHAR(50),
        phone_secondary VARCHAR(50),
        email VARCHAR(100),
        website VARCHAR(255),
        description TEXT,
        specialty VARCHAR(255),
        monday_open TIME,
        monday_close TIME,
        tuesday_open TIME,
        tuesday_close TIME,
        wednesday_open TIME,
        wednesday_close TIME,
        thursday_open TIME,
        thursday_close TIME,
        friday_open TIME,
        friday_close TIME,
        saturday_open TIME,
        saturday_close TIME,
        sunday_open TIME,
        sunday_close TIME,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );

    -- Create clinic_services table if not exists
    CREATE TABLE IF NOT EXISTS clinic_services (
        id INT PRIMARY KEY AUTO_INCREMENT,
        clinic_id INT NOT NULL,
        service_name VARCHAR(255) NOT NULL,
        description TEXT,
        category VARCHAR(100),
        duration_minutes INT,
        price DECIMAL(10, 2),
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (clinic_id) REFERENCES clinic_info(id) ON DELETE CASCADE
    );

    -- Insert default clinic (only if not exists)
    INSERT IGNORE INTO clinic_info (
        id, name, address_street, address_number, address_city, address_country,
        postal_code, phone_primary, phone_secondary, email, website, description, specialty,
        monday_open, monday_close, tuesday_open, tuesday_close, wednesday_open, wednesday_close,
        thursday_open, thursday_close, friday_open, friday_close, saturday_open, saturday_close,
        sunday_open, sunday_close
    ) VALUES (
        1,
        'DentHelp Dental Clinic',
        'Strada Gheorghe Lazăr',
        '12',
        'Timișoara',
        'Romania',
        '300081',
        '0721321111',
        '0256123456',
        'contact@denthelp.ro',
        'www.denthelp.ro',
        'Modern dental clinic offering comprehensive dental care services including general dentistry, orthodontics, implantology, and pediatric dentistry. We use the latest technology to provide the best care for our patients.',
        'General Dentistry, Orthodontics, Implantology, Pediatric Dentistry',
        '07:00:00', '20:00:00',
        '07:00:00', '20:00:00',
        '07:00:00', '20:00:00',
        '07:00:00', '20:00:00',
        '07:00:00', '20:00:00',
        '07:00:00', '20:00:00',
        NULL, NULL
    );

    -- Insert default clinic services (only if not exists)
    INSERT IGNORE INTO clinic_services (clinic_id, service_name, description, category, duration_minutes, price) VALUES
    (1, 'Consultation and Diagnosis', 'Initial examination and treatment planning', 'General', 30, 100.00),
    (1, 'Professional Cleaning', 'Teeth cleaning and polishing', 'Hygiene', 45, 150.00),
    (1, 'Dental Filling', 'Cavity treatment with composite filling', 'Restorative', 60, 200.00),
    (1, 'Root Canal Treatment', 'Endodontic treatment for infected tooth', 'Endodontics', 90, 400.00),
    (1, 'Tooth Extraction', 'Simple tooth extraction', 'Surgery', 30, 150.00),
    (1, 'Dental Implant', 'Single tooth implant placement', 'Implantology', 120, 1500.00),
    (1, 'Orthodontic Consultation', 'Initial orthodontic assessment', 'Orthodontics', 45, 150.00),
    (1, 'Braces Installation', 'Metal or ceramic braces', 'Orthodontics', 120, 2000.00),
    (1, 'Teeth Whitening', 'Professional whitening treatment', 'Cosmetic', 60, 300.00),
    (1, 'Pediatric Dentistry', 'Dental care for children', 'Pediatric', 30, 120.00);

    -- Verify
    SELECT '✓ Clinic data initialized!' AS status;
    SELECT COUNT(*) AS clinic_count FROM clinic_info;
    SELECT COUNT(*) AS services_count FROM clinic_services;
EOSQL

echo "✓ patient_db initialization complete!"

echo ""
echo "================================================"
echo "✓ ALL DATABASES INITIALIZED SUCCESSFULLY!"
echo "================================================"
echo ""
echo "Default Accounts Created:"
echo "  - admin@denthelp.ro (ADMIN)"
echo "  - radiologist@denthelp.ro (RADIOLOGIST)"
echo "  - patient@denthelp.ro (PATIENT)"
echo "  - test@denthelp.ro (PATIENT)"
echo ""
echo "Default Clinic Created:"
echo "  - DentHelp Dental Clinic"
echo "  - 10 services available"
echo ""
echo "All accounts use password: password123"
echo "================================================"
