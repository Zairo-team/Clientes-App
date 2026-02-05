-- medical_records_schema.sql
-- Creates tables: medical_record_fields, medical_records, medical_record_data
-- Includes indexes, RLS policies (auth.uid()), and triggers to update updated_at

-- Ensure pgcrypto for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1) medical_record_fields
CREATE TABLE IF NOT EXISTS public.medical_record_fields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

  field_name TEXT NOT NULL,
  field_type TEXT NOT NULL CHECK (field_type IN ('text','number','date','textarea','select','checkbox','multi-input')),

  is_required BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  options TEXT,
  placeholder TEXT,
  is_active BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_medical_record_fields_professional ON public.medical_record_fields(professional_id);

ALTER TABLE public.medical_record_fields ENABLE ROW LEVEL SECURITY;

CREATE POLICY "professionals_select_medical_record_fields"
  ON public.medical_record_fields FOR SELECT
  USING (professional_id = auth.uid());

CREATE POLICY "professionals_insert_medical_record_fields"
  ON public.medical_record_fields FOR INSERT
  WITH CHECK (professional_id = auth.uid());

CREATE POLICY "professionals_update_medical_record_fields"
  ON public.medical_record_fields FOR UPDATE
  USING (professional_id = auth.uid());

CREATE POLICY "professionals_delete_medical_record_fields"
  ON public.medical_record_fields FOR DELETE
  USING (professional_id = auth.uid());

-- 2) medical_records
CREATE TABLE IF NOT EXISTS public.medical_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,

  title TEXT DEFAULT 'Medical Record',

  patient_full_name TEXT NOT NULL,
  patient_dni TEXT,
  patient_age INTEGER,
  patient_phone TEXT,
  patient_email TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_medical_records_professional ON public.medical_records(professional_id);
CREATE INDEX IF NOT EXISTS idx_medical_records_patient ON public.medical_records(patient_id);

ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "professionals_select_medical_records"
  ON public.medical_records FOR SELECT
  USING (professional_id = auth.uid());

CREATE POLICY "professionals_insert_medical_records"
  ON public.medical_records FOR INSERT
  WITH CHECK (professional_id = auth.uid());

CREATE POLICY "professionals_update_medical_records"
  ON public.medical_records FOR UPDATE
  USING (professional_id = auth.uid());

CREATE POLICY "professionals_delete_medical_records"
  ON public.medical_records FOR DELETE
  USING (professional_id = auth.uid());

-- 3) medical_record_data
CREATE TABLE IF NOT EXISTS public.medical_record_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  medical_record_id UUID NOT NULL REFERENCES public.medical_records(id) ON DELETE CASCADE,
  field_id UUID NOT NULL REFERENCES public.medical_record_fields(id) ON DELETE CASCADE,

  value TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_medical_record_data_record ON public.medical_record_data(medical_record_id);
CREATE INDEX IF NOT EXISTS idx_medical_record_data_field ON public.medical_record_data(field_id);

ALTER TABLE public.medical_record_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "professionals_select_medical_record_data"
  ON public.medical_record_data FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.medical_records mr
      WHERE mr.id = medical_record_data.medical_record_id
      AND mr.professional_id = auth.uid()
    )
  );

CREATE POLICY "professionals_insert_medical_record_data"
  ON public.medical_record_data FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.medical_records mr
      WHERE mr.id = medical_record_data.medical_record_id
      AND mr.professional_id = auth.uid()
    )
  );

CREATE POLICY "professionals_update_medical_record_data"
  ON public.medical_record_data FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.medical_records mr
      WHERE mr.id = medical_record_data.medical_record_id
      AND mr.professional_id = auth.uid()
    )
  );

CREATE POLICY "professionals_delete_medical_record_data"
  ON public.medical_record_data FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.medical_records mr
      WHERE mr.id = medical_record_data.medical_record_id
      AND mr.professional_id = auth.uid()
    )
  );

-- Trigger function to keep updated_at current
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_medical_record_fields_updated_at
BEFORE UPDATE ON public.medical_record_fields
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_medical_records_updated_at
BEFORE UPDATE ON public.medical_records
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_medical_record_data_updated_at
BEFORE UPDATE ON public.medical_record_data
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
