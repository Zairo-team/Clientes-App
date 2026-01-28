import { createClient } from '../supabase/client'
import type { Appointment } from '../supabase/client'

/**
 * Get appointments for a professional within a date range
 */
export async function getAppointments(
    professionalId: string,
    startDate: string,
    endDate: string
) {
    const supabase = createClient()

    const { data, error } = await supabase
        .from('appointments')
        .select(`
      *,
      patient:patients(*),
      service:services(*)
    `)
        .eq('professional_id', professionalId)
        .gte('appointment_date', startDate)
        .lte('appointment_date', endDate)
        .order('appointment_date', { ascending: true })
        .order('start_time', { ascending: true })

    if (error) throw error
    return data
}

/**
 * Get today's appointments
 */
export async function getTodayAppointments(professionalId: string) {
    const supabase = createClient()
    const today = new Date().toISOString().split('T')[0]

    const { data, error } = await supabase
        .from('appointments')
        .select(`
      *,
      patient:patients(*),
      service:services(*)
    `)
        .eq('professional_id', professionalId)
        .eq('appointment_date', today)
        .eq('status', 'scheduled')
        .order('start_time', { ascending: true })

    if (error) throw error
    return data
}

/**
 * Get upcoming appointments
 */
export async function getUpcomingAppointments(professionalId: string, limit: number = 10) {
    const supabase = createClient()
    const today = new Date().toISOString().split('T')[0]

    const { data, error } = await supabase
        .from('appointments')
        .select(`
      *,
      patient:patients(*),
      service:services(*)
    `)
        .eq('professional_id', professionalId)
        .gte('appointment_date', today)
        .eq('status', 'scheduled')
        .order('appointment_date', { ascending: true })
        .order('start_time', { ascending: true })
        .limit(limit)

    if (error) throw error
    return data
}

/**
 * Create a new appointment
 */
export async function createAppointment(appointment: Omit<Appointment, 'id' | 'created_at' | 'updated_at'>) {
    const supabase = createClient()

    const { data, error } = await supabase
        .from('appointments')
        .insert([appointment])
        .select()
        .single()

    if (error) throw error
    return data
}

/**
 * Update an appointment
 */
export async function updateAppointment(id: string, updates: Partial<Appointment>) {
    const supabase = createClient()

    const { data, error } = await supabase
        .from('appointments')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

    if (error) throw error
    return data
}

/**
 * Cancel an appointment
 */
export async function cancelAppointment(id: string, reason?: string) {
    const supabase = createClient()

    const { data, error } = await supabase
        .from('appointments')
        .update({
            status: 'cancelled',
            cancellation_reason: reason,
        })
        .eq('id', id)
        .select()
        .single()

    if (error) throw error
    return data
}

/**
 * Mark appointment as completed
 */
export async function completeAppointment(id: string) {
    const supabase = createClient()

    const { data, error } = await supabase
        .from('appointments')
        .update({ status: 'completed' })
        .eq('id', id)
        .select()
        .single()

    if (error) throw error
    return data
}

/**
 * Delete an appointment
 */
export async function deleteAppointment(id: string) {
    const supabase = createClient()

    const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', id)

    if (error) throw error
}
