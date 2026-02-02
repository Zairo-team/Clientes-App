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
    onConfirm: (amount: number) => Promise<void>
    remainingBalance: number
}

export function RegisterPaymentModal({
    isOpen,
    onClose,
    onConfirm,
    remainingBalance,
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

        if (numAmount > remainingBalance) {
            setError(`El monto no puede ser mayor al saldo pendiente (${formatCurrency(remainingBalance)})`)
            return
        }

        try {
            setLoading(true)
            setError('')
            await onConfirm(numAmount)
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

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Registrar Pago</DialogTitle>
                    <DialogDescription>
                        Registra un pago parcial o total del saldo pendiente.
                        El monto máximo a pagar es {formatCurrency(remainingBalance)}.
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
                                max={remainingBalance}
                            />
                        </div>
                        {error && (
                            <p className="text-sm text-red-500">{error}</p>
                        )}
                    </div>

                    <div className="bg-muted rounded-lg p-3 space-y-1">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Saldo pendiente actual:</span>
                            <span className="font-medium">{formatCurrency(remainingBalance)}</span>
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
