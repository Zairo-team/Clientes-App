'use server'

import { createClient } from '@/lib/supabase/client'
import type { MedicalRecordField, MedicalRecord, MedicalRecordData } from '@/lib/supabase/client'

// ==================== MEDICAL RECORD FIELDS ====================

export async function getMedicalRecordFields(professionalId: string): Promise<MedicalRecordField[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('medical_record_fields')
    .select('*')
    .eq('professional_id', professionalId)
    .eq('is_active', true)
    .order('display_order', { ascending: true })

  if (error) throw error
  return data || []
}

export async function createDefaultMedicalFields(professionalId: string): Promise<MedicalRecordField[]> {
  const supabase = createClient()

  const defaultFields = [
    {
      professional_id: professionalId,
      field_name: 'Weight (kg)',
      field_type: 'number' as const,
      is_required: false,
      display_order: 1,
      placeholder: '70',
      is_active: true,
    },
    {
      professional_id: professionalId,
      field_name: 'Height (cm)',
      field_type: 'number' as const,
      is_required: false,
      display_order: 2,
      placeholder: '170',
      is_active: true,
    },
    {
      professional_id: professionalId,
      field_name: 'Blood Pressure',
      field_type: 'text' as const,
      is_required: false,
      display_order: 3,
      placeholder: 'Ex: 120/80',
      is_active: true,
    },
    {
      professional_id: professionalId,
      field_name: 'Medical History',
      field_type: 'textarea' as const,
      is_required: false,
      display_order: 4,
      is_active: true,
    },
    {
      professional_id: professionalId,
      field_name: 'Allergies',
      field_type: 'textarea' as const,
      is_required: false,
      display_order: 5,
      is_active: true,
    },
    {
      professional_id: professionalId,
      field_name: 'Current Medications',
      field_type: 'textarea' as const,
      is_required: false,
      display_order: 6,
      is_active: true,
    },
  ]

  const { data, error } = await supabase
    .from('medical_record_fields')
    .insert(defaultFields)
    .select()

  if (error) throw error
  return data || []
}

export async function createMedicalRecordField(
  professionalId: string,
  fieldData: Omit<MedicalRecordField, 'id' | 'professional_id' | 'created_at' | 'updated_at'>
): Promise<MedicalRecordField> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('medical_record_fields')
    .insert({
      ...fieldData,
      professional_id: professionalId,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateMedicalRecordField(
  fieldId: string,
  updates: Partial<Omit<MedicalRecordField, 'id' | 'professional_id' | 'created_at' | 'updated_at'>>
): Promise<MedicalRecordField> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('medical_record_fields')
    .update(updates)
    .eq('id', fieldId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteMedicalRecordField(fieldId: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('medical_record_fields')
    .update({ is_active: false })
    .eq('id', fieldId)

  if (error) throw error
}

// ==================== MEDICAL RECORDS ====================

export async function getMedicalRecord(patientId: string): Promise<MedicalRecord | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('medical_records')
    .select('*')
    .eq('patient_id', patientId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) throw error
  return data
}

export async function createMedicalRecord(
  professionalId: string,
  patientId: string,
  patientData: {
    full_name: string
    dni?: string | null
    age?: number | null
    phone?: string | null
    email?: string | null
  }
): Promise<MedicalRecord> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('medical_records')
    .insert({
      professional_id: professionalId,
      patient_id: patientId,
      title: 'Medical Record',
      patient_full_name: patientData.full_name,
      patient_dni: patientData.dni || null,
      patient_age: patientData.age || null,
      patient_phone: patientData.phone || null,
      patient_email: patientData.email || null,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateMedicalRecord(
  medicalRecordId: string,
  updates: Partial<Omit<MedicalRecord, 'id' | 'professional_id' | 'patient_id' | 'created_at' | 'updated_at'>>
): Promise<MedicalRecord> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('medical_records')
    .update(updates)
    .eq('id', medicalRecordId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteMedicalRecord(medicalRecordId: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase.from('medical_records').delete().eq('id', medicalRecordId)

  if (error) throw error
}

// ==================== MEDICAL RECORD DATA ====================

export async function saveMedicalRecordData(
  medicalRecordId: string,
  fieldValues: Array<{ field_id: string; value: string | null }>
): Promise<MedicalRecordData[]> {
  const supabase = createClient()

  await supabase.from('medical_record_data').delete().eq('medical_record_id', medicalRecordId)

  const { data, error } = await supabase
    .from('medical_record_data')
    .insert(
      fieldValues.map((fv) => ({
        medical_record_id: medicalRecordId,
        field_id: fv.field_id,
        value: fv.value,
      }))
    )
    .select()

  if (error) throw error
  return data || []
}

export async function getMedicalRecordData(medicalRecordId: string): Promise<MedicalRecordData[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('medical_record_data')
    .select('*')
    .eq('medical_record_id', medicalRecordId)

  if (error) throw error
  return data || []
}

export async function ensureDefaultFieldsExist(professionalId: string): Promise<MedicalRecordField[]> {
  const existingFields = await getMedicalRecordFields(professionalId)

  if (existingFields.length === 0) {
    return await createDefaultMedicalFields(professionalId)
  }

  return existingFields
}
