import { createClient } from '../supabase/client'
import type { Sale } from '../supabase/client'

/**
 * Get sales for a professional within a date range
 */
export async function getSales(
    professionalId: string,
    startDate: string,
    endDate: string
) {
    const supabase = createClient()

    const { data, error } = await supabase
        .from('sales')
        .select(`
      *,
      patient:patients(*),
      service:services(*)
    `)
        .eq('professional_id', professionalId)
        .gte('service_date', startDate)
        .lte('service_date', endDate)
        .order('service_date', { ascending: false })

    if (error) throw error
    return data
}

/**
 * Get sales for current month
 */
export async function getCurrentMonthSales(professionalId: string) {
    const supabase = createClient()
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]

    return getSales(professionalId, startOfMonth, endOfMonth)
}

/**
 * Get pending payments
 */
export async function getPendingPayments(professionalId: string) {
    const supabase = createClient()

    const { data, error } = await supabase
        .from('sales')
        .select(`
      *,
      patient:patients(*),
      service:services(*)
    `)
        .eq('professional_id', professionalId)
        .eq('payment_status', 'pending')
        .order('service_date', { ascending: false })

    if (error) throw error
    return data
}

/**
 * Get billing statistics for a professional
 */
export async function getBillingStats(professionalId: string) {
    const supabase = createClient()
    const now = new Date()
    const today = now.toISOString().split('T')[0]
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]

    // Monthly billing
    const { data: monthlyData } = await supabase
        .from('sales')
        .select('amount')
        .eq('professional_id', professionalId)
        .eq('payment_status', 'paid')
        .gte('service_date', startOfMonth)

    // Daily billing
    const { data: dailyData } = await supabase
        .from('sales')
        .select('amount')
        .eq('professional_id', professionalId)
        .eq('payment_status', 'paid')
        .eq('service_date', today)

    // Pending payments
    const { data: pendingData } = await supabase
        .from('sales')
        .select('amount')
        .eq('professional_id', professionalId)
        .eq('payment_status', 'pending')

    const monthlyTotal = (monthlyData as any[] || []).reduce((sum, item) => sum + Number(item.amount), 0)
    const dailyTotal = (dailyData as any[] || []).reduce((sum, item) => sum + Number(item.amount), 0)
    const pendingTotal = (pendingData as any[] || []).reduce((sum, item) => sum + Number(item.amount), 0)

    return {
        monthlyTotal,
        dailyTotal,
        pendingTotal,
        pendingCount: pendingData?.length || 0,
        dailySessionCount: dailyData?.length || 0,
    }
}

/**
 * Create a new sale
 */
export async function createSale(sale: Omit<Sale, 'id' | 'created_at' | 'updated_at'>): Promise<Sale> {
    const supabase = createClient()

    const { data, error } = await (supabase
        .from('sales')
        .insert([sale])
        .select()
        .single() as any)

    if (error) throw error
    return data as Sale
}

/**
 * Update a sale
 */
export async function updateSale(id: string, updates: Partial<Sale>) {
    const supabase = createClient()

    const { data, error } = await (supabase
        .from('sales')
        .update(updates)
        .eq('id', id)
        .select()
        .single() as any)

    if (error) throw error
    return data
}

/**
 * Mark sale as paid
 */
export async function markSaleAsPaid(
    id: string,
    paymentMethod: string,
    paymentDate?: string
) {
    const supabase = createClient()

    const { data, error } = await (supabase
        .from('sales')
        .update({
            payment_status: 'paid',
            payment_method: paymentMethod,
            payment_date: paymentDate || new Date().toISOString().split('T')[0],
        })
        .eq('id', id)
        .select()
        .single() as any)

    if (error) throw error
    return data
}

/**
 * Delete a sale
 */
export async function deleteSale(id: string) {
    const supabase = createClient()

    const { error } = await supabase
        .from('sales')
        .delete()
        .eq('id', id)

    if (error) throw error
}
