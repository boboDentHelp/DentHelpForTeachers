-- SQL Script to fix null CNPs in patient_personal_data table
-- WARNING: This assigns temporary CNPs. Replace with real patient CNPs!

-- First, check which records have null CNPs
SELECT * FROM patient_personal_data WHERE patientCnp IS NULL;

-- Option 1: Delete invalid records (if they're test data)
-- DELETE FROM patient_personal_data WHERE patientCnp IS NULL;

-- Option 2: Update with valid CNPs (replace with real CNPs!)
-- UPDATE patient_personal_data
-- SET patientCnp = '1234567890123'  -- Replace with actual CNP
-- WHERE idPersonalData = 1;

-- If you have multiple null CNPs, update each one individually:
-- UPDATE patient_personal_data SET patientCnp = '1234567890123' WHERE idPersonalData = 1;
-- UPDATE patient_personal_data SET patientCnp = '9876543210987' WHERE idPersonalData = 2;
-- etc...

-- After fixing, verify no null CNPs remain:
SELECT * FROM patient_personal_data WHERE patientCnp IS NULL;
