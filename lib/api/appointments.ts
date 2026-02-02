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

import { logAppointmentCreated, logPaymentReceived } from './activity'
import { createSale } from './sales'

/**
 * Create a new appointment
 */
export async function createAppointment(
    appointment: Omit<Appointment, 'id' | 'created_at' | 'updated_at'>,
    patientNameForLog?: string
) {
    const supabase = createClient()

    const { data, error } = await supabase
        .from('appointments')
        .insert([appointment])
        .select()
        .single()

    if (error) throw error

    // Log activity if patient name is provided
    if (data && patientNameForLog) {
        // Run in background to not block
        logAppointmentCreated(
            appointment.professional_id,
            data.id,
            appointment.patient_id,
            patientNameForLog,
            appointment.appointment_date
        ).catch(err => console.error('Error logging appointment creation:', err))
    }

    // If a deposit was provided at creation, persist it as a Sale so it appears in payment history
    try {
        const deposit = (appointment as any).deposit_amount || 0
        if (deposit && deposit > 0) {
            // Try to fetch service name for the sale
            const supabase = createClient()
            let serviceName = 'Servicio'
            if (appointment.service_id) {
                const { data: svc } = await supabase.from('services').select('name').eq('id', appointment.service_id).single()
                if (svc && (svc as any).name) serviceName = (svc as any).name
            }

            const sale = await createSale({
                professional_id: appointment.professional_id,
                patient_id: appointment.patient_id,
                service_id: appointment.service_id,
                appointment_id: data.id,
                service_name: serviceName,
                service_date: appointment.appointment_date,
                amount: deposit,
                payment_status: 'paid',
                payment_date: appointment.appointment_date,
                notes: 'Depósito/Adelanto al crear cita',
            })

            // Log payment activity
            logPaymentReceived(
                appointment.professional_id,
                sale.id,
                appointment.patient_id,
                patientNameForLog || '',
                deposit
            ).catch(err => console.error('Error logging deposit payment:', err))

            // Recalculate remaining balance for this appointment considering sales
            try {
                // Sum sales for this appointment
                const { data: salesData, error: salesError } = await supabase
                    .from('sales')
                    .select('amount')
                    .eq('appointment_id', data.id)

                if (!salesError) {
                    const totalPaidInSales = (salesData || []).reduce((sum: number, s: any) => sum + Number(s.amount), 0)
                    const totalAmount = (appointment as any).total_amount || 0
                    // If there are sales, treat them as authoritative
                    const remaining = totalPaidInSales > 0 ? Math.max(0, totalAmount - totalPaidInSales) : Math.max(0, totalAmount - ((appointment as any).deposit_amount || 0))

                    await supabase
                        .from('appointments')
                        .update({
                            remaining_balance: remaining,
                            balance_paid: remaining <= 0,
                            payment_status: remaining <= 0 ? 'paid' : (totalPaidInSales > 0 || ((appointment as any).deposit_amount || 0) > 0) ? 'partial' : 'unpaid',
                            updated_at: new Date().toISOString()
                        })
                        .eq('id', data.id)
                }
            } catch (err) {
                console.error('Error recalculating remaining after creating sale:', err)
            }
        }
    } catch (err) {
        console.error('Error creating deposit sale after appointment creation:', err)
    }

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
