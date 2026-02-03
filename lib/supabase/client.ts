import { createBrowserClient } from '@supabase/ssr'

// Types for database tables
export type Profile = {
  id: string
  email: string
  full_name: string
  professional_title?: string | null
  phone?: string | null
  avatar_url?: string | null
  business_name?: string | null
  notifications_whatsapp?: boolean | null
  notifications_email?: boolean | null
  created_at: string
  updated_at: string
}

export type Patient = {
  id: string
  professional_id: string
  full_name: string
  dni: string // Documento Nacional de Identidad (obligatorio)
  email?: string | null
  phone?: string | null
  date_of_birth?: string | null
  notes?: string | null
  status?: 'active' | 'inactive' | 'archived' // Deprecated - no longer used
  created_at: string
  updated_at: string
  last_session_date?: string | null
}

export type Service = {
  id: string
  professional_id: string
  name: string
  category: string
  description?: string | null
  duration_minutes: number
  price: number
  color: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export type Appointment = {
  id: string
  professional_id: string
  patient_id: string
  service_id: string
  appointment_date: string
  start_time: string
  end_time: string
  is_video_call: boolean
  location?: string | null
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show' | 'rescheduled'
  notes?: string | null
  cancellation_reason?: string | null
  // Payment fields
  total_amount?: number | null
  deposit_amount?: number | null
  deposit_paid?: boolean | null
  remaining_balance?: number | null
  balance_paid?: boolean | null
  payment_status?: 'unpaid' | 'partial' | 'paid' | null
  created_at: string
  updated_at: string
}

export type Sale = {
  id: string
  professional_id: string
  patient_id: string
  service_id: string
  appointment_id?: string | null
  service_name: string
  service_date: string
  amount: number
  payment_status: 'pending' | 'paid' | 'cancelled' | 'refunded'
  payment_method?: string | null
  payment_date?: string | null
  notes?: string | null
  created_at: string
  updated_at: string
}

export type ActivityLog = {
  id: string
  professional_id: string
  activity_type: string
  patient_id?: string | null
  appointment_id?: string | null
  sale_id?: string | null
  title: string
  description?: string | null
  created_at: string
}

export type MedicalRecordField = {
  id: string
  professional_id: string
  field_name: string
  field_type: 'text' | 'number' | 'date' | 'textarea' | 'select' | 'checkbox'
  is_required: boolean
  display_order: number
  options?: string | null
  placeholder?: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export type MedicalRecord = {
  id: string
  professional_id: string
  patient_id: string
  title: string
  patient_full_name: string
  patient_dni?: string | null
  patient_age?: number | null
  patient_phone?: string | null
  patient_email?: string | null
  created_at: string
  updated_at: string
}

export type MedicalRecordData = {
  id: string
  medical_record_id: string
  field_id: string
  value?: string | null
  created_at: string
  updated_at: string
}

// Database type with all tables for Supabase client
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'created_at' | 'updated_at'>
        Update: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>
      }
      patients: {
        Row: Patient
        Insert: Omit<Patient, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Patient, 'id' | 'professional_id' | 'created_at' | 'updated_at'>>
      }
      services: {
        Row: Service
        Insert: Omit<Service, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Service, 'id' | 'professional_id' | 'created_at' | 'updated_at'>>
      }
      appointments: {
        Row: Appointment
        Insert: Omit<Appointment, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Appointment, 'id' | 'professional_id' | 'created_at' | 'updated_at'>>
      }
      sales: {
        Row: Sale
        Insert: Omit<Sale, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Sale, 'id' | 'professional_id' | 'created_at' | 'updated_at'>>
      }
      activity_log: {
        Row: ActivityLog
        Insert: Omit<ActivityLog, 'id' | 'created_at'>
        Update: never
      }
      medical_record_fields: {
        Row: MedicalRecordField
        Insert: Omit<MedicalRecordField, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<MedicalRecordField, 'id' | 'professional_id' | 'created_at' | 'updated_at'>>
      }
      medical_records: {
        Row: MedicalRecord
        Insert: Omit<MedicalRecord, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<MedicalRecord, 'id' | 'professional_id' | 'patient_id' | 'created_at' | 'updated_at'>>
      }
      medical_record_data: {
        Row: MedicalRecordData
        Insert: Omit<MedicalRecordData, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<MedicalRecordData, 'id' | 'medical_record_id' | 'field_id' | 'created_at' | 'updated_at'>>
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Create Supabase client
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
