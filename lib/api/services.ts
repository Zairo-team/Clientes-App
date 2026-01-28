import { createClient } from '../supabase/client'
import type { Service } from '../supabase/client'

/**
 * Get all active services for a professional
 */
export async function getServices(professionalId: string) {
    const supabase = createClient()

    const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('professional_id', professionalId)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

    if (error) throw error
    return data
}

/**
 * Get all services (including inactive) for a professional
 */
export async function getAllServices(professionalId: string) {
    const supabase = createClient()

    const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('professional_id', professionalId)
        .order('created_at', { ascending: false })

    if (error) throw error
    return data
}

/**
 * Get a single service by ID
 */
export async function getService(id: string) {
    const supabase = createClient()

    const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('id', id)
        .single()

    if (error) throw error
    return data
}

/**
 * Create a new service
 */
export async function createService(service: Omit<Service, 'id' | 'created_at' | 'updated_at'>) {
    const supabase = createClient()

    const { data, error } = await supabase
        .from('services')
        .insert([service])
        .select()
        .single()

    if (error) throw error
    return data
}

/**
 * Update an existing service
 */
export async function updateService(id: string, updates: Partial<Service>) {
    const supabase = createClient()

    const { data, error } = await supabase
        .from('services')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

    if (error) throw error
    return data
}

/**
 * Delete a service (soft delete by marking as inactive)
 */
export async function deleteService(id: string) {
    const supabase = createClient()

    const { error } = await supabase
        .from('services')
        .update({ is_active: false })
        .eq('id', id)

    if (error) throw error
}

/**
 * Permanently delete a service
 */
export async function permanentlyDeleteService(id: string) {
    const supabase = createClient()

    const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', id)

    if (error) throw error
}
