-- Migration: Add 'multi-input' field type to medical_record_fields
-- Date: 2026-02-05
-- Description: Allows creating multi-input (tags) fields in medical records

-- Step 1: Find the exact constraint name (run this first to get the name)
-- SELECT conname, pg_get_constraintdef(oid)
-- FROM pg_constraint
-- WHERE conrelid = 'public.medical_record_fields'::regclass
--   AND contype = 'c';
-- Copy the constraint name from the result and replace <CONSTRAINT_NAME> below

-- Step 2: Execute the migration
BEGIN;

-- Drop the old constraint
ALTER TABLE public.medical_record_fields
  DROP CONSTRAINT <CONSTRAINT_NAME>;

-- Add the new constraint with 'multi-input' type
ALTER TABLE public.medical_record_fields
  ADD CONSTRAINT medical_record_fields_field_type_check
  CHECK (field_type IN ('text','number','date','textarea','select','checkbox','multi-input'));

COMMIT;

-- Step 3: Verify the constraint was updated
-- SELECT conname, pg_get_constraintdef(oid)
-- FROM pg_constraint
-- WHERE conrelid = 'public.medical_record_fields'::regclass
--   AND contype = 'c'
-- ORDER BY conname;
