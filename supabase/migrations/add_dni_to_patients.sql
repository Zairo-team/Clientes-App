-- =====================================================
-- MIGRATION: Update Patients Table Structure
-- Date: 2025-01-27
-- Description: Add DNI field as REQUIRED and UNIQUE, remove address/emergency contact fields
-- =====================================================

-- Add DNI column with NOT NULL and UNIQUE constraints
-- Note: If you have existing patients without DNI, you need to update them first
ALTER TABLE patients ADD COLUMN IF NOT EXISTS dni TEXT NOT NULL UNIQUE;

-- If the column already exists without constraints, run these instead:
-- ALTER TABLE patients ALTER COLUMN dni SET NOT NULL;
-- CREATE UNIQUE INDEX IF NOT EXISTS idx_patients_dni_unique ON patients(dni);

-- Remove deprecated columns (optional - solo si quieres eliminar los datos)
-- ADVERTENCIA: Esto eliminará permanentemente los datos de estas columnas
-- Descomenta las siguientes líneas solo si estás seguro

-- ALTER TABLE patients DROP COLUMN IF EXISTS address;
-- ALTER TABLE patients DROP COLUMN IF EXISTS emergency_contact_name;
-- ALTER TABLE patients DROP COLUMN IF EXISTS emergency_contact_phone;

-- Si prefieres mantener los datos históricos pero no usarlos en la app,
-- simplemente deja las columnas en la base de datos sin eliminarlas.
-- Los nuevos pacientes no tendrán esos campos, pero los antiguos los conservarán.

-- =====================================================
-- END OF MIGRATION
-- =====================================================
