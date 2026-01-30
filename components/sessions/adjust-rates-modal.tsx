import { useState, useEffect } from 'react'
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

type AdjustRatesModalProps = {
    isOpen: boolean
    onClose: () => void
    onConfirm: (totalAmount: number, depositAmount: number) => Promise<void>
    currentTotal: number
    currentDeposit: number
}

export function AdjustRatesModal({
    isOpen,
    onClose,
    onConfirm,
    currentTotal,
    currentDeposit,
}: AdjustRatesModalProps) {
    const [totalAmount, setTotalAmount] = useState(currentTotal.toString())
    const [depositAmount, setDepositAmount] = useState(currentDeposit.toString())
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        if (isOpen) {
            setTotalAmount(currentTotal.toString())
            setDepositAmount(currentDeposit.toString())
            setError('')
        }
    }, [isOpen, currentTotal, currentDeposit])

    const handleConfirm = async () => {
        const numTotal = parseFloat(totalAmount)
        const numDeposit = parseFloat(depositAmount)

        // Validations
        if (isNaN(numTotal) || numTotal < 0) {
            setError('El total debe ser un número positivo')
            return
        }

        if (isNaN(numDeposit) || numDeposit < 0) {
            setError('La seña debe ser un número positivo')
            return
        }

        if (numDeposit > numTotal) {
            setError('La seña no puede ser mayor que el total')
            return
        }

        try {
            setLoading(true)
            setError('')
            await onConfirm(numTotal, numDeposit)
            onClose()
        } catch (err: any) {
            setError(err.message || 'Error al actualizar las tarifas')
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

    const calculatedBalance = (parseFloat(totalAmount) || 0) - (parseFloat(depositAmount) || 0)

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Ajustar Tarifas</DialogTitle>
                    <DialogDescription>
                        Modifica el total del servicio y el monto de la seña.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="total">Total del Servicio</Label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                $
                            </span>
                            <Input
                                id="total"
                                type="number"
                                placeholder="0.00"
                                value={totalAmount}
                                onChange={(e) => {
                                    setTotalAmount(e.target.value)
                                    setError('')
                                }}
                                className="pl-7"
                                step="0.01"
                                min="0"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="deposit">Seña / Anticipo</Label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                $
                            </span>
                            <Input
                                id="deposit"
                                type="number"
                                placeholder="0.00"
                                value={depositAmount}
                                onChange={(e) => {
                                    setDepositAmount(e.target.value)
                                    setError('')
                                }}
                                className="pl-7"
                                step="0.01"
                                min="0"
                                max={totalAmount}
                            />
                        </div>
                    </div>

                    {error && (
                        <p className="text-sm text-red-500">{error}</p>
                    )}

                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-blue-700 dark:text-blue-400 font-medium">
                                Saldo Pendiente:
                            </span>
                            <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                                {formatCurrency(calculatedBalance >= 0 ? calculatedBalance : 0)}
                            </span>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={loading}>
                        Cancelar
                    </Button>
                    <Button onClick={handleConfirm} disabled={loading}>
                        {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Guardar Cambios
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
