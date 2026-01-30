import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Loader2 } from 'lucide-react'

type RegisterPaymentModalProps = {
    isOpen: boolean
    onClose: () => void
    onConfirm: (amount: number, type: 'deposit' | 'balance') => Promise<void>
    remainingBalance: number
    depositAmount: number
    depositPaid: boolean
}

export function RegisterPaymentModal({
    isOpen,
    onClose,
    onConfirm,
    remainingBalance,
    depositAmount,
    depositPaid,
}: RegisterPaymentModalProps) {
    const [amount, setAmount] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleConfirm = async () => {
        const numAmount = parseFloat(amount)

        if (isNaN(numAmount) || numAmount <= 0) {
            setError('Ingresa un monto válido')
            return
        }

        if (!depositPaid && numAmount > depositAmount) {
            setError(`El monto no puede ser mayor a la seña (${formatCurrency(depositAmount)})`)
            return
        }

        if (depositPaid && numAmount > remainingBalance) {
            setError(`El monto no puede ser mayor al saldo pendiente (${formatCurrency(remainingBalance)})`)
            return
        }

        try {
            setLoading(true)
            setError('')
            const paymentType = !depositPaid ? 'deposit' : 'balance'
            await onConfirm(numAmount, paymentType)
            setAmount('')
            onClose()
        } catch (err: any) {
            setError(err.message || 'Error al registrar el pago')
        } finally {
            setLoading(false)
        }
    }

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
        }).format(value)
    }

    const paymentType = !depositPaid ? 'seña' : 'saldo'
    const maxAmount = !depositPaid ? depositAmount : remainingBalance

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Registrar Pago de {paymentType.charAt(0).toUpperCase() + paymentType.slice(1)}</DialogTitle>
                    <DialogDescription>
                        Registra el pago de {paymentType}. El monto máximo es {formatCurrency(maxAmount)}.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="amount">Monto a Registrar</Label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                $
                            </span>
                            <Input
                                id="amount"
                                type="number"
                                placeholder="0.00"
                                value={amount}
                                onChange={(e) => {
                                    setAmount(e.target.value)
                                    setError('')
                                }}
                                className="pl-7"
                                step="0.01"
                                min="0"
                                max={maxAmount}
                            />
                        </div>
                        {error && (
                            <p className="text-sm text-red-500">{error}</p>
                        )}
                    </div>

                    <div className="bg-muted rounded-lg p-3 space-y-1">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Tipo de pago:</span>
                            <span className="font-medium capitalize">{paymentType}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Monto {paymentType}:</span>
                            <span className="font-medium">{formatCurrency(depositPaid ? remainingBalance : depositAmount)}</span>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={loading}>
                        Cancelar
                    </Button>
                    <Button onClick={handleConfirm} disabled={loading}>
                        {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Registrar Pago
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
