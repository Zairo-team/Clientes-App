import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import type { Sale } from '@/lib/supabase/client'
import { Calendar, DollarSign, CreditCard } from 'lucide-react'

type PaymentHistoryListProps = {
    payments: Sale[]
}

export function PaymentHistoryList({ payments }: PaymentHistoryListProps) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
        }).format(amount)
    }

    if (payments.length === 0) {
        return (
            <div className="bg-card rounded-xl border p-6 text-center shadow-sm">
                <div className="mx-auto size-12 rounded-full bg-muted flex items-center justify-center mb-3">
                    <DollarSign className="size-6 text-muted-foreground" />
                </div>
                <h3 className="font-medium text-foreground">No hay pagos registrados</h3>
                <p className="text-sm text-muted-foreground mt-1">
                    Los pagos que registres aparecerán aquí.
                </p>
            </div>
        )
    }

    return (
        <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
            <div className="p-4 border-b flex items-center gap-2">
                <CreditCard className="size-4 text-muted-foreground" />
                <h3 className="font-bold text-sm">Historial de Pagos</h3>
            </div>

            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="w-[100px]">Fecha</TableHead>
                            <TableHead>Concepto</TableHead>
                            <TableHead className="text-right">Monto</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {payments.map((payment) => (
                            <TableRow key={payment.id}>
                                <TableCell className="font-medium text-xs">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="size-3 text-muted-foreground" />
                                        {format(new Date(payment.created_at), 'dd/MM/yyyy', { locale: es })}
                                    </div>
                                </TableCell>
                                <TableCell className="text-xs text-muted-foreground">
                                    Pago registrado
                                </TableCell>
                                <TableCell className="text-right font-bold text-sm text-emerald-600">
                                    + {formatCurrency(payment.amount)}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
