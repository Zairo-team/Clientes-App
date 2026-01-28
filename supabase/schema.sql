-- =====================================================
-- SUPABASE DATABASE SCHEMA - MULTI-TENANT
-- Sistema de Gestión de Clientes Profesionales
-- =====================================================

-- =====================================================
-- 1. PROFILES TABLE (Profesionales/Usuarios)
-- =====================================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  professional_title TEXT, -- e.g., "Psicólogo Clínico", "Nutricionista"
  phone TEXT,
  avatar_url TEXT,
  business_name TEXT, -- Nombre del consultorio/práctica
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- =====================================================
-- 2. PATIENTS TABLE (Pacientes)
-- =====================================================
CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Información Personal
  full_name TEXT NOT NULL,
  dni TEXT NOT NULL UNIQUE, -- Documento Nacional de Identidad (obligatorio y único)
  email TEXT,
  phone TEXT,
  date_of_birth DATE,
  
  -- Notas
  notes TEXT, -- Notas generales del profesional
  
  -- Estado
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_session_date TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_patients_professional ON patients(professional_id);
CREATE INDEX idx_patients_status ON patients(professional_id, status);

-- Enable RLS
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Professionals can view own patients"
  ON patients FOR SELECT
  USING (professional_id = auth.uid());

CREATE POLICY "Professionals can insert own patients"
  ON patients FOR INSERT
  WITH CHECK (professional_id = auth.uid());

CREATE POLICY "Professionals can update own patients"
  ON patients FOR UPDATE
  USING (professional_id = auth.uid());

CREATE POLICY "Professionals can delete own patients"
  ON patients FOR DELETE
  USING (professional_id = auth.uid());

-- =====================================================
-- 3. SERVICES TABLE (Servicios)
-- =====================================================
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Información del Servicio
  name TEXT NOT NULL,
  category TEXT NOT NULL, -- e.g., "Terapia", "Nutrición", "Consulta"
  description TEXT,
  
  -- Configuración
  duration_minutes INTEGER NOT NULL, -- Duración en minutos
  price DECIMAL(10, 2) NOT NULL, -- Precio en Pesos Argentinos
  color TEXT DEFAULT 'blue', -- Para UI: blue, purple, emerald, etc.
  
  -- Estado
  is_active BOOLEAN DEFAULT true,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_services_professional ON services(professional_id);
CREATE INDEX idx_services_active ON services(professional_id, is_active);

-- Enable RLS
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Professionals can view own services"
  ON services FOR SELECT
  USING (professional_id = auth.uid());

CREATE POLICY "Professionals can insert own services"
  ON services FOR INSERT
  WITH CHECK (professional_id = auth.uid());

CREATE POLICY "Professionals can update own services"
  ON services FOR UPDATE
  USING (professional_id = auth.uid());

CREATE POLICY "Professionals can delete own services"
  ON services FOR DELETE
  USING (professional_id = auth.uid());

-- =====================================================
-- 4. APPOINTMENTS TABLE (Citas)
-- =====================================================
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE RESTRICT,
  
  -- Información de la Cita
  appointment_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  
  -- Modalidad
  is_video_call BOOLEAN DEFAULT false,
  location TEXT, -- Dirección o link de videollamada
  
  -- Estado
  status TEXT DEFAULT 'scheduled' CHECK (
    status IN ('scheduled', 'completed', 'cancelled', 'no_show', 'rescheduled')
  ),
  
  -- Notas
  notes TEXT,
  cancellation_reason TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_appointments_professional ON appointments(professional_id);
CREATE INDEX idx_appointments_patient ON appointments(patient_id);
CREATE INDEX idx_appointments_date ON appointments(professional_id, appointment_date);
CREATE INDEX idx_appointments_status ON appointments(professional_id, status);

-- Enable RLS
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Professionals can view own appointments"
  ON appointments FOR SELECT
  USING (professional_id = auth.uid());

CREATE POLICY "Professionals can insert own appointments"
  ON appointments FOR INSERT
  WITH CHECK (professional_id = auth.uid());

CREATE POLICY "Professionals can update own appointments"
  ON appointments FOR UPDATE
  USING (professional_id = auth.uid());

CREATE POLICY "Professionals can delete own appointments"
  ON appointments FOR DELETE
  USING (professional_id = auth.uid());

-- =====================================================
-- 5. SALES TABLE (Ventas/Servicios Completados)
-- =====================================================
CREATE TABLE sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE RESTRICT,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE RESTRICT,
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  
  -- Información de la Venta
  service_name TEXT NOT NULL, -- Snapshot del nombre del servicio
  service_date DATE NOT NULL,
  amount DECIMAL(10, 2) NOT NULL, -- Monto en Pesos Argentinos
  
  -- Estado de Pago
  payment_status TEXT DEFAULT 'pending' CHECK (
    payment_status IN ('pending', 'paid', 'cancelled', 'refunded')
  ),
  payment_method TEXT, -- 'cash', 'card', 'transfer', etc.
  payment_date DATE,
  
  -- Notas
  notes TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_sales_professional ON sales(professional_id);
CREATE INDEX idx_sales_patient ON sales(patient_id);
CREATE INDEX idx_sales_date ON sales(professional_id, service_date);
CREATE INDEX idx_sales_payment_status ON sales(professional_id, payment_status);

-- Enable RLS
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Professionals can view own sales"
  ON sales FOR SELECT
  USING (professional_id = auth.uid());

CREATE POLICY "Professionals can insert own sales"
  ON sales FOR INSERT
  WITH CHECK (professional_id = auth.uid());

CREATE POLICY "Professionals can update own sales"
  ON sales FOR UPDATE
  USING (professional_id = auth.uid());

CREATE POLICY "Professionals can delete own sales"
  ON sales FOR DELETE
  USING (professional_id = auth.uid());

-- =====================================================
-- 6. ACTIVITY_LOG TABLE (Registro de Actividad)
-- =====================================================
CREATE TABLE activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Información de la Actividad
  activity_type TEXT NOT NULL CHECK (
    activity_type IN (
      'patient_created', 'patient_updated',
      'appointment_created', 'appointment_completed', 'appointment_cancelled',
      'payment_received', 'note_added'
    )
  ),
  
  -- Referencias
  patient_id UUID REFERENCES patients(id) ON DELETE SET NULL,
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  sale_id UUID REFERENCES sales(id) ON DELETE SET NULL,
  
  -- Detalles
  title TEXT NOT NULL,
  description TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_activity_professional ON activity_log(professional_id, created_at DESC);

-- Enable RLS
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Professionals can view own activity"
  ON activity_log FOR SELECT
  USING (professional_id = auth.uid());

CREATE POLICY "Professionals can create own activity"
  ON activity_log FOR INSERT
  WITH CHECK (professional_id = auth.uid());

-- =====================================================
-- 7. FUNCTIONS & TRIGGERS
-- =====================================================

-- Function: Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all relevant tables
CREATE TRIGGER update_profiles_updated_at 
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_patients_updated_at 
  BEFORE UPDATE ON patients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_services_updated_at 
  BEFORE UPDATE ON services
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at 
  BEFORE UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sales_updated_at 
  BEFORE UPDATE ON sales
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function: Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Usuario')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Create profile when auth user is created
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- END OF SCHEMA DEFINITION
-- =====================================================
