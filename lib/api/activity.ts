import { createClient } from '../supabase/client'
import type { ActivityLog } from '../supabase/client'

/**
 * Get recent activity for a professional
 */
export async function getRecentActivity(professionalId: string, limit: number = 20) {
    const supabase = createClient()

    const { data, error } = await supabase
        .from('activity_log')
        .select('*')
        .eq('professional_id', professionalId)
        .order('created_at', { ascending: false })
        .limit(limit)

    if (error) throw error
    return data
}

/**
 * Log a new activity
 */
export async function logActivity(
    activity: Omit<ActivityLog, 'id' | 'created_at'>
) {
    const supabase = createClient()

    const { data, error } = await supabase
        .from('activity_log')
        .insert([activity])
        .select()
        .single()

    if (error) throw error
    return data
}

/**
 * Helper functions to log specific activities
 */

export async function logPatientCreated(
    professionalId: string,
    patientId: string,
    patientName: string
) {
    return logActivity({
        professional_id: professionalId,
        activity_type: 'patient_created',
        patient_id: patientId,
        title: 'Nuevo paciente registrado',
        description: `${patientName} se ha unido a la clínica.`,
    })
}

export async function logAppointmentCreated(
    professionalId: string,
    appointmentId: string,
    patientId: string,
    patientName: string,
    date: string
) {
    return logActivity({
        professional_id: professionalId,
        activity_type: 'appointment_created',
        appointment_id: appointmentId,
        patient_id: patientId,
        title: 'Nueva cita agendada',
        description: `Cita con ${patientName} programada para ${date}.`,
    })
}

export async function logAppointmentCompleted(
    professionalId: string,
    appointmentId: string,
    patientId: string,
    patientName: string
) {
    return logActivity({
        professional_id: professionalId,
        activity_type: 'appointment_completed',
        appointment_id: appointmentId,
        patient_id: patientId,
        title: 'Sesión completada',
        description: `Sesión con ${patientName} finalizada.`,
    })
}

export async function logPaymentReceived(
    professionalId: string,
    saleId: string,
    patientId: string,
    patientName: string,
    amount: number
) {
    return logActivity({
        professional_id: professionalId,
        activity_type: 'payment_received',
        sale_id: saleId,
        patient_id: patientId,
        title: 'Pago recibido',
        description: `${patientName} ha pagado $${amount.toFixed(2)}.`,
    })
}
