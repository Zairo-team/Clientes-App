import { createClient } from '@/lib/supabase/client'
import type { Appointment } from '@/lib/supabase/client'
import { logAppointmentCompleted, logAppointmentCancelled, logPaymentReceived } from './activity'

/**
 * Get detailed information about a specific session/appointment
 */
export async function getSessionDetail(sessionId: string, professionalId: string) {
    const supabase = createClient()

    const { data, error } = await supabase
        .from('appointments')
        .select(`
      *,
      service:services(id, name, price, color),
      patient:patients(id, full_name, dni, email, phone, date_of_birth)
    `)
        .eq('id', sessionId)
        .eq('professional_id', professionalId)
        .single()

    if (error) {
        console.error('Error fetching session:', error)
        throw new Error(`Error al cargar la sesión: ${error.message}`)
    }

    return data
}

/**
 * Update session notes
 */
export async function updateSessionNotes(sessionId: string, notes: string, professionalId: string) {
    const supabase = createClient()

    const { data, error } = await supabase
        .from('appointments')
        .update({
            notes,
            updated_at: new Date().toISOString()
        })
        .eq('id', sessionId)
        .eq('professional_id', professionalId)
        .select()
        .single()

    if (error) {
        console.error('Error updating notes:', error)
        throw new Error(`Error al guardar notas: ${error.message}`)
    }

    return data
}

/**
 * Update session status
 */
export async function updateSessionStatus(
    sessionId: string,
    status: 'scheduled' | 'completed' | 'cancelled' | 'no_show',
    professionalId: string
) {
    const supabase = createClient()

    const { data, error } = await supabase
        .from('appointments')
        .update({
            status,
            updated_at: new Date().toISOString()
        })
        .eq('id', sessionId)
        .eq('professional_id', professionalId)
        .select('*, patient:patients(full_name)')
        .single()

    if (error) {
        console.error('Error updating status:', error)
        throw new Error(`Error al actualizar estado: ${error.message}`)
    }

    // Log Activity
    if (status === 'completed' || status === 'cancelled') {
        const patientName = (data as any).patient?.full_name
        if (patientName) {
            const logFunc = status === 'completed' ? logAppointmentCompleted : logAppointmentCancelled
            logFunc(
                professionalId,
                sessionId,
                data.patient_id,
                patientName
            ).catch(err => console.error('Error logging status change:', err))
        }
    }

    return data
}

/**
 * Get payments history for a specific session
 */
export async function getSessionPayments(sessionId: string) {
    const supabase = createClient()

    const { data, error } = await supabase
        .from('sales')
        .select('*')
        .eq('appointment_id', sessionId)
        .order('created_at', { ascending: false })

    if (error) {
        throw new Error(`Error al cargar historial de pagos: ${error.message}`)
    }

    return data
}

/**
 * Register a payment by creating a Sale record
 * This automatically links the payment to the session and patient for reports
 */
export async function registerPayment(
    sessionId: string,
    amount: number,
    professionalId: string
) {
    const supabase = createClient()

    // 1. Get current session data to link patient and service
    const { data: session, error: fetchError } = await supabase
        .from('appointments')
        .select(`
            *,
            service:services(name),
            patient:patients(full_name)
        `)
        .eq('id', sessionId)
        .eq('professional_id', professionalId)
        .single()

    if (fetchError) {
        throw new Error(`Error al obtener sesión: ${fetchError.message}`)
    }

    // 2. Insert into SALES table
    // Note: We use existing 'sales' table which has appointment_id foreign key
    const { data: saleData, error: saleError } = await supabase
        .from('sales')
        .insert({
            professional_id: professionalId,
            patient_id: session.patient_id,
            service_id: session.service_id,
            appointment_id: sessionId,
            service_name: session.service?.name || 'Servicio de Sesión',
            service_date: session.appointment_date,
            amount: amount,
            payment_status: 'paid', // Instant payment
            payment_date: new Date().toISOString().split('T')[0],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        })
        .select()
        .single()

    if (saleError) {
        throw new Error(`Error al registrar venta: ${saleError.message}`)
    }

    // Log Payment
    if (saleData && (session as any).patient?.full_name) {
        logPaymentReceived(
            professionalId,
            saleData.id,
            session.patient_id,
            (session as any).patient.full_name,
            amount
        ).catch(err => console.error('Error logging payment:', err))
    }

    // 3. Recalculate remaining balance for the appointment
    return recalcSessionBalance(sessionId, professionalId)
}

/**
 * Recalculate session balance based on total amount, deposit, and registered sales
 */
async function recalcSessionBalance(sessionId: string, professionalId: string) {
    const supabase = createClient()

    // Get Session Data
    const { data: session, error: sessionError } = await supabase
        .from('appointments')
        .select('total_amount, deposit_amount')
        .eq('id', sessionId)
        .single()

    if (sessionError) throw sessionError

    // Get Sum of Sales for this session
    const { data: sales, error: salesError } = await supabase
        .from('sales')
        .select('amount')
        .eq('appointment_id', sessionId)

    if (salesError) throw salesError

    const totalPaidInSales = sales.reduce((sum, sale) => sum + Number(sale.amount), 0)

    // Remaining = Total - Deposit - Sum(Sales)
    const totalAmount = session.total_amount || 0
    const depositAmount = session.deposit_amount || 0

    // Ensure accurate calculation
    const remainingBalance = Math.max(0, totalAmount - depositAmount - totalPaidInSales)

    // Determine Status
    let paymentStatus = 'unpaid'
    if (remainingBalance <= 0) {
        paymentStatus = 'paid'
    } else if (depositAmount > 0 || totalPaidInSales > 0) {
        paymentStatus = 'partial'
    }

    // Update Appointment
    const { data: updatedSession, error: updateError } = await supabase
        .from('appointments')
        .update({
            remaining_balance: remainingBalance,
            payment_status: paymentStatus,
            balance_paid: remainingBalance <= 0,
            updated_at: new Date().toISOString()
        })
        .eq('id', sessionId)
        .eq('professional_id', professionalId)
        .select()
        .single()

    if (updateError) throw updateError

    return updatedSession
}

/**
 * Update session rates (total amount and deposit)
 * Triggers a balance recalculation
 */
export async function updateSessionRates(
    sessionId: string,
    totalAmount: number,
    depositAmount: number,
    professionalId: string
) {
    const supabase = createClient()

    // Validate amounts
    if (depositAmount > totalAmount) {
        throw new Error('La seña no puede ser mayor que el total')
    }

    if (totalAmount < 0 || depositAmount < 0) {
        throw new Error('Los montos deben ser positivos')
    }

    // Update rates first
    const { error } = await supabase
        .from('appointments')
        .update({
            total_amount: totalAmount,
            deposit_amount: depositAmount,
            deposit_paid: depositAmount > 0,
            updated_at: new Date().toISOString()
        })
        .eq('id', sessionId)
        .eq('professional_id', professionalId)

    if (error) {
        throw new Error(`Error al actualizar tarifas: ${error.message}`)
    }

    // Recalculate balance considering existing payments
    return recalcSessionBalance(sessionId, professionalId)
}
