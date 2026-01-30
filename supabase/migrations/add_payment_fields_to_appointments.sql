-- Migration: Add payment fields to appointments table
-- This adds support for managing session payments including deposit and remaining balance

ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS total_amount DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS deposit_amount DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS deposit_paid BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS remaining_balance DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS balance_paid BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'unpaid';

-- Add check constraint to ensure payment_status has valid values
ALTER TABLE appointments
ADD CONSTRAINT check_payment_status 
CHECK (payment_status IN ('unpaid', 'partial', 'paid'));

-- Create index for faster queries on payment_status
CREATE INDEX IF NOT EXISTS idx_appointments_payment_status ON appointments(payment_status);

-- Update existing records to have default payment status
UPDATE appointments
SET payment_status = 'unpaid'
WHERE payment_status IS NULL;
