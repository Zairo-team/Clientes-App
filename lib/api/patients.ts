import { createClient } from '../supabase/client'
import type { Patient } from '../supabase/client'

/**
 * Get all patients for a professional
 */
export async function getPatients(professionalId: string) {
    const supabase = createClient()

    const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('professional_id', professionalId)
        .order('created_at', { ascending: false })

    if (error) throw error
    return data
}

/**
 * Get a single patient by ID
 */
export async function getPatient(id: string) {
    const supabase = createClient()

    const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('id', id)
        .single()

    if (error) throw error
    return data
}

/**
 * Create a new patient
 */
export async function createPatient(patient: Omit<Patient, 'id' | 'created_at' | 'updated_at'>) {
    const supabase = createClient()

    const { data, error } = await supabase
        .from('patients')
        .insert([patient])
        .select()
        .single()

    if (error) throw error
    return data
}

/**
 * Update an existing patient
 */
export async function updatePatient(id: string, updates: Partial<Patient>) {
    const supabase = createClient()

    const { data, error } = await supabase
        .from('patients')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

    if (error) throw error
    return data
}

/**
 * Delete a patient
 */
export async function deletePatient(id: string) {
    const supabase = createClient()

    const { error } = await supabase
        .from('patients')
        .delete()
        .eq('id', id)

    if (error) throw error
}

/**
 * Search patients by name, DNI, or email
 * - Name: searches if query is contained anywhere (ilike %query%)
 * - DNI: searches only if it starts with query (ilike query%)
 * - Email: searches if query is contained anywhere (ilike %query%)
 */
export async function searchPatients(professionalId: string, query: string) {
    const supabase = createClient()

    const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('professional_id', professionalId)
        .or(`full_name.ilike.%${query}%,dni.ilike.${query}%,email.ilike.%${query}%`)
        .order('created_at', { ascending: false })

    if (error) throw error
    return data
}
