import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CreditCard, DollarSign, Edit } from 'lucide-react'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'

type SessionPaymentPanelProps = {
    session: {
        id: string
        status: 'scheduled' | 'completed' | 'cancelled' | 'no_show'
        total_amount: number | null
        deposit_amount: number | null
        deposit_paid: boolean | null
        remaining_balance: number | null
        balance_paid: boolean | null
        payment_status: 'unpaid' | 'partial' | 'paid' | null
    }
    onStatusChange: (status: 'scheduled' | 'completed' | 'cancelled' | 'no_show') => void
    onRegisterPayment: () => void
    onAdjustRates: () => void
}

export function SessionPaymentPanel({
    session,
    onStatusChange,
    onRegisterPayment,
    onAdjustRates,
}: SessionPaymentPanelProps) {
    const totalAmount = session.total_amount || 0
    const depositAmount = session.deposit_amount || 0
    const remainingBalance = session.remaining_balance || 0
    const depositPaid = session.deposit_paid || false
    const balancePaid = session.balance_paid || false

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
            minimumFractionDigits: 2,
        }).format(amount)
    }

    const getStatusLabel = (status: string) => {
        const labels = {
            scheduled: 'Programada',
            completed: 'Completada',
            cancelled: 'Cancelada',
            no_show: 'No asistió',
        }
        return labels[status as keyof typeof labels] || status
    }

    return (
        <div className="bg-card rounded-xl border p-4 md:p-6 shadow-sm space-y-6">
            <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-bold">Gestión del Pago</h3>
            </div>

            {/* Session Status */}
            <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 block">
                    Estado de la Sesión
                </label>
                <Select value={session.status} onValueChange={onStatusChange}>
                    <SelectTrigger className="w-full">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="scheduled">Programada</SelectItem>
                        <SelectItem value="completed">Completada</SelectItem>
                        <SelectItem value="cancelled">Cancelada</SelectItem>
                        <SelectItem value="no_show">No asistió</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Payment Details */}
            <div className="space-y-3 pt-3 border-t">
                {/* Total Amount */}
                <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total del Servicio</span>
                    <span className="text-sm font-bold text-foreground">
                        {formatCurrency(totalAmount)}
                    </span>
                </div>

                {/* Deposit Amount */}
                <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Seña Recibida</span>
                    <div className="flex items-center gap-2">
                        <Badge
                            variant={depositPaid ? 'default' : 'secondary'}
                            className={depositPaid ? 'bg-emerald-500 text-white' : 'bg-amber-100 text-amber-700'}
                        >
                            {depositPaid ? 'PAGADO' : 'PENDIENTE'}
                        </Badge>
                        <span className="text-sm font-medium">
                            {formatCurrency(depositAmount)}
                        </span>
                    </div>
                </div>

                {/* Remaining Balance */}
                <div className="flex items-center justify-between pt-3 border-t">
                    <span className="text-sm font-bold text-foreground">Saldo Pendiente</span>
                    <span className="text-2xl font-bold text-blue-600">
                        {formatCurrency(remainingBalance)}
                    </span>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-3 border-t">
                <Button
                    onClick={onRegisterPayment}
                    disabled={balancePaid || remainingBalance <= 0}
                    className="w-full flex items-center gap-2"
                >
                    <DollarSign className="w-4 h-4" />
                    Registrar Pago Saldo
                </Button>
                <Button
                    onClick={onAdjustRates}
                    variant="outline"
                    className="w-full flex items-center gap-2"
                >
                    <Edit className="w-4 h-4" />
                    Ajustar Tarifas
                </Button>
            </div>

            {/* Payment Status Summary */}
            {balancePaid && (
                <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-3">
                    <p className="text-sm text-emerald-700 dark:text-emerald-400 font-medium text-center">
                        ✓ Pago completo registrado
                    </p>
                </div>
            )}
        </div>
    )
}
