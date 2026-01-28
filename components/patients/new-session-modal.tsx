'use client'

import { useState, useEffect, FormEvent } from 'react'
import { X, Plus, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/lib/auth-context'
import { getServices } from '@/lib/api/services'
import { createSale } from '@/lib/api/sales'
import { logPaymentReceived } from '@/lib/api/activity'
import { useToast } from '@/hooks/use-toast'
import type { Service } from '@/lib/supabase/client'

interface NewSessionModalProps {
    isOpen: boolean
    onClose: () => void
    patientId: string
    patientName: string
    onSessionCreated: () => void
}

export function NewSessionModal({
    isOpen,
    onClose,
    patientId,
    patientName,
    onSessionCreated,
}: NewSessionModalProps) {
    const { profile } = useAuth()
    const { toast } = useToast()
    const [loading, setLoading] = useState(false)
    const [services, setServices] = useState<Service[]>([])
    const [formData, setFormData] = useState({
        service_id: '',
        service_date: new Date().toISOString().split('T')[0],
        payment_status: 'paid' as 'paid' | 'pending',
        payment_method: '',
        notes: '',
    })

    useEffect(() => {
        if (isOpen && profile?.id) {
            loadServices()
        }
    }, [isOpen, profile])

    const loadServices = async () => {
        if (!profile?.id) return
        try {
            const data = await getServices(profile.id)
            setServices(data)
        } catch (error) {
            console.error('Error loading services:', error)
        }
    }

    const getSelectedService = () => {
        return services.find(s => s.id === formData.service_id)
    }

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        if (!profile?.id) return

        const selectedService = getSelectedService()
        if (!selectedService) {
            toast({
                title: 'Error',
                description: 'Por favor selecciona un servicio',
                variant: 'destructive',
            })
            return
        }

        setLoading(true)
        try {
            const sale = await createSale({
                professional_id: profile.id,
                patient_id: patientId,
                service_id: formData.service_id,
                service_name: selectedService.name,
                service_date: formData.service_date,
                amount: selectedService.price,
                payment_status: formData.payment_status,
                payment_method: formData.payment_method || null,
                payment_date: formData.payment_status === 'paid' ? formData.service_date : null,
                notes: formData.notes || null,
            })

            // Log activity if payment received
            if (formData.payment_status === 'paid') {
                await logPaymentReceived(
                    profile.id,
                    patientId,
                    sale.id,
                    patientName,
                    selectedService.price
                )
            }

            toast({
                title: '¡Sesión registrada!',
                description: `La sesión de ${selectedService.name} ha sido registrada exitosamente.`,
            })

            // Reset form
            setFormData({
                service_id: '',
                service_date: new Date().toISOString().split('T')[0],
                payment_status: 'paid',
                payment_method: '',
                notes: '',
            })

            onSessionCreated()
            onClose()
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'No se pudo registrar la sesión',
                variant: 'destructive',
            })
        } finally {
            setLoading(false)
        }
    }

    if (!isOpen) return null

    const selectedService = getSelectedService()

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[95vh] overflow-hidden">
                {/* Header */}
                <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-primary/10 text-primary size-10 rounded-xl flex items-center justify-center">
                            <Plus className="size-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Nueva Sesión</h2>
                            <p className="text-slate-500 text-xs font-medium">
                                Paciente: <span className="text-primary font-semibold">{patientName}</span>
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    >
                        <X className="size-5" />
                    </button>
                </div>

                {/* Content */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-6">
                    {/* Service Selection */}
                    <div className="space-y-2">
                        <Label htmlFor="service" className="text-xs font-bold uppercase tracking-wider text-slate-400">
                            Servicio Realizado *
                        </Label>
                        <Select value={formData.service_id} onValueChange={(value) => setFormData({ ...formData, service_id: value })} required>
                            <SelectTrigger id="service" className="h-12 rounded-xl">
                                <SelectValue placeholder="Seleccionar servicio" />
                            </SelectTrigger>
                            <SelectContent>
                                {services.map((service) => (
                                    <SelectItem key={service.id} value={service.id}>
                                        {service.name} - ${service.price.toLocaleString('es-AR')}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Service Date */}
                    <div className="space-y-2">
                        <Label htmlFor="service_date" className="text-xs font-bold uppercase tracking-wider text-slate-400">
                            Fecha de la Sesión *
                        </Label>
                        <Input
                            id="service_date"
                            type="date"
                            value={formData.service_date}
                            onChange={(e) => setFormData({ ...formData, service_date: e.target.value })}
                            className="h-12 rounded-xl"
                            required
                            max={new Date().toISOString().split('T')[0]}
                        />
                    </div>

                    {/* Amount Display */}
                    {selectedService && (
                        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Monto del servicio:</span>
                                <span className="text-2xl font-bold text-primary">
                                    ${selectedService.price.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Payment Status */}
                    <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                            Estado del Pago *
                        </Label>
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, payment_status: 'paid' })}
                                className={`flex-1 py-3 px-4 rounded-xl border text-sm font-semibold transition-all ${formData.payment_status === 'paid'
                                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm'
                                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-emerald-500'
                                    }`}
                            >
                                ✓ Pagado
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, payment_status: 'pending' })}
                                className={`flex-1 py-3 px-4 rounded-xl border text-sm font-semibold transition-all ${formData.payment_status === 'pending'
                                        ? 'border-amber-500 bg-amber-50 text-amber-700 shadow-sm'
                                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-amber-500'
                                    }`}
                            >
                                ⏰ Pendiente
                            </button>
                        </div>
                    </div>

                    {/* Payment Method (only if paid) */}
                    {formData.payment_status === 'paid' && (
                        <div className="space-y-2">
                            <Label htmlFor="payment_method" className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                Método de Pago
                            </Label>
                            <Select
                                value={formData.payment_method}
                                onValueChange={(value) => setFormData({ ...formData, payment_method: value })}
                            >
                                <SelectTrigger id="payment_method" className="h-12 rounded-xl">
                                    <SelectValue placeholder="Seleccionar método de pago" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="cash">Efectivo</SelectItem>
                                    <SelectItem value="transfer">Transferencia</SelectItem>
                                    <SelectItem value="card">Tarjeta</SelectItem>
                                    <SelectItem value="mercadopago">MercadoPago</SelectItem>
                                    <SelectItem value="other">Otro</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {/* Notes */}
                    <div className="space-y-2">
                        <Label htmlFor="notes" className="text-xs font-bold uppercase tracking-wider text-slate-400">
                            Notas de la Sesión
                        </Label>
                        <Textarea
                            id="notes"
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            placeholder="Escribe notas sobre la sesión, observaciones, progreso del paciente..."
                            rows={4}
                            className="rounded-xl resize-none"
                        />
                    </div>
                </form>

                {/* Footer */}
                <div className="px-8 py-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col-reverse sm:flex-row justify-end gap-3">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={onClose}
                        className="h-11 px-6 rounded-xl"
                        disabled={loading}
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        className="h-11 px-8 rounded-xl gap-2"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="size-4 animate-spin" />
                                Registrando...
                            </>
                        ) : (
                            <>
                                <Plus className="size-4" />
                                Registrar Sesión
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    )
}
