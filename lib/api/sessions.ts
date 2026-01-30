import { createClient } from '@/lib/supabase/client'
import type { Appointment } from '@/lib/supabase/client'

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
        .select()
        .single()

    if (error) {
        console.error('Error updating status:', error)
        throw new Error(`Error al actualizar estado: ${error.message}`)
    }

    return data
}

/**
 * Register a payment (deposit or remaining balance)
 */
export async function registerPayment(
    sessionId: string,
    amount: number,
    type: 'deposit' | 'balance',
    professionalId: string
) {
    const supabase = createClient()

    // First get current session data
    const { data: session, error: fetchError } = await supabase
        .from('appointments')
        .select('*')
        .eq('id', sessionId)
        .eq('professional_id', professionalId)
        .single()

    if (fetchError) {
        throw new Error(`Error al obtener sesión: ${fetchError.message}`)
    }

    let updateData: any = {
        updated_at: new Date().toISOString()
    }

    if (type === 'deposit') {
        updateData.deposit_paid = true
        updateData.remaining_balance = (session.total_amount || 0) - (session.deposit_amount || 0)
    } else {
        updateData.balance_paid = true
        updateData.remaining_balance = 0
    }

    // Calculate payment status
    const totalAmount = session.total_amount || 0
    const depositAmount = session.deposit_amount || 0
    const depositPaid = type === 'deposit' ? true : session.deposit_paid
    const balancePaid = type === 'balance' ? true : session.balance_paid

    if (depositPaid && balancePaid) {
        updateData.payment_status = 'paid'
    } else if (depositPaid || balancePaid) {
        updateData.payment_status = 'partial'
    } else {
        updateData.payment_status = 'unpaid'
    }

    const { data, error } = await supabase
        .from('appointments')
        .update(updateData)
        .eq('id', sessionId)
        .eq('professional_id', professionalId)
        .select()
        .single()

    if (error) {
        throw new Error(`Error al registrar pago: ${error.message}`)
    }

    return data
}

/**
 * Update session rates (total amount and deposit)
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

    // Calculate remaining balance
    const remainingBalance = totalAmount - depositAmount

    const { data, error } = await supabase
        .from('appointments')
        .update({
            total_amount: totalAmount,
            deposit_amount: depositAmount,
            remaining_balance: remainingBalance,
            updated_at: new Date().toISOString()
        })
        .eq('id', sessionId)
        .eq('professional_id', professionalId)
        .select()
        .single()

    if (error) {
        throw new Error(`Error al actualizar tarifas: ${error.message}`)
    }

    return data
}
