'use client'

import { useState, useEffect, FormEvent } from 'react'
import { X, Calendar as CalendarIcon, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/lib/auth-context'
import { getServices } from '@/lib/api/services'
import { createAppointment } from '@/lib/api/appointments'
import { useToast } from '@/hooks/use-toast'
import type { Service } from '@/lib/supabase/client'

interface ScheduleAppointmentModalProps {
  isOpen: boolean
  onClose: () => void
  patientId: string
  patientName: string
  onAppointmentCreated: () => void
}

export function ScheduleAppointmentModal({
  isOpen,
  onClose,
  patientId,
  patientName,
  onAppointmentCreated,
}: ScheduleAppointmentModalProps) {
  const { profile } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [services, setServices] = useState<Service[]>([])
  const [formData, setFormData] = useState({
    service_id: '',
    appointment_date: '',
    start_time: '',
    end_time: '',
    is_video_call: false,
    location: '',
    notes: '',
    deposit_amount: '',
  })
  const [selectedServicePrice, setSelectedServicePrice] = useState<number>(0)

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

  const handleServiceChange = (serviceId: string) => {
    const service = services.find(s => s.id === serviceId)
    if (service && formData.start_time) {
      // Calculate end time based on service duration
      const [hours, minutes] = formData.start_time.split(':').map(Number)
      const startMinutes = hours * 60 + minutes
      const endMinutes = startMinutes + service.duration_minutes
      const endHours = Math.floor(endMinutes / 60)
      const endMins = endMinutes % 60
      const endTime = `${String(endHours).padStart(2, '0')}:${String(endMins).padStart(2, '0')}`

      setFormData({
        ...formData,
        service_id: serviceId,
        end_time: endTime,
      })
    } else {
      setFormData({ ...formData, service_id: serviceId })
    }

    if (service) {
      setSelectedServicePrice(service.price)
    }
  }

  const handleStartTimeChange = (startTime: string) => {
    const service = services.find(s => s.id === formData.service_id)
    if (service) {
      const [hours, minutes] = startTime.split(':').map(Number)
      const startMinutes = hours * 60 + minutes
      const endMinutes = startMinutes + service.duration_minutes
      const endHours = Math.floor(endMinutes / 60)
      const endMins = endMinutes % 60
      const endTime = `${String(endHours).padStart(2, '0')}:${String(endMins).padStart(2, '0')}`

      setFormData({
        ...formData,
        start_time: startTime,
        end_time: endTime,
      })
    } else {
      setFormData({ ...formData, start_time: startTime })
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!profile?.id) return

    setLoading(true)
    try {
      await createAppointment({
        professional_id: profile.id,
        patient_id: patientId,
        service_id: formData.service_id,
        appointment_date: formData.appointment_date,
        start_time: formData.start_time,
        end_time: formData.end_time,
        is_video_call: formData.is_video_call,
        location: formData.location || null,
        status: 'scheduled',
        notes: formData.notes || null,
        // Payment fields
        total_amount: selectedServicePrice,
        deposit_amount: formData.deposit_amount ? Number(formData.deposit_amount) : 0,
        deposit_paid: !!formData.deposit_amount && Number(formData.deposit_amount) > 0,
        remaining_balance: Math.max(0, selectedServicePrice - (formData.deposit_amount ? Number(formData.deposit_amount) : 0)),
        payment_status: (formData.deposit_amount && Number(formData.deposit_amount) > 0) ? 'partial' : 'unpaid',
        balance_paid: false
      }, patientName)

      toast({
        title: '¡Cita agendada!',
        description: `La cita con ${patientName} ha sido programada exitosamente.`,
      })

      // Reset form
      setFormData({
        service_id: '',
        appointment_date: '',
        start_time: '',
        end_time: '',
        is_video_call: false,
        location: '',
        notes: '',
        deposit_amount: '',
      })
      setSelectedServicePrice(0)

      onAppointmentCreated()
      onClose()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo agendar la cita',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 text-primary size-10 rounded-xl flex items-center justify-center">
              <CalendarIcon className="size-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Programar Cita</h2>
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
              Servicio *
            </Label>
            <Select value={formData.service_id} onValueChange={handleServiceChange} required>
              <SelectTrigger id="service" className="h-12 rounded-xl">
                <SelectValue placeholder="Seleccionar servicio" />
              </SelectTrigger>
              <SelectContent>
                {services.map((service) => (
                  <SelectItem key={service.id} value={service.id}>
                    {service.name} - {service.duration_minutes} min - ${service.price}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date" className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Fecha *
              </Label>
              <Input
                id="date"
                type="date"
                value={formData.appointment_date}
                onChange={(e) => setFormData({ ...formData, appointment_date: e.target.value })}
                className="h-12 rounded-xl"
                required
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="start_time" className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Hora Inicio *
              </Label>
              <Input
                id="start_time"
                type="time"
                value={formData.start_time}
                onChange={(e) => handleStartTimeChange(e.target.value)}
                className="h-12 rounded-xl"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_time" className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Hora Fin
              </Label>
              <Input
                id="end_time"
                type="time"
                value={formData.end_time}
                className="h-12 rounded-xl bg-muted"
                readOnly
              />
            </div>
          </div>

          {/* Modality */}
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Modalidad
            </Label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, is_video_call: false })}
                className={`flex-1 py-3 px-4 rounded-xl border text-sm font-semibold transition-all ${!formData.is_video_call
                  ? 'border-primary bg-primary/5 text-primary shadow-sm'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-primary'
                  }`}
              >
                Presencial
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, is_video_call: true })}
                className={`flex-1 py-3 px-4 rounded-xl border text-sm font-semibold transition-all ${formData.is_video_call
                  ? 'border-primary bg-primary/5 text-primary shadow-sm'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-primary'
                  }`}
              >
                Videollamada
              </button>
            </div>
          </div>

          {/* Location (only if presencial) */}
          {!formData.is_video_call && (
            <div className="space-y-2">
              <Label htmlFor="location" className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Ubicación
              </Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Dirección del consultorio"
                className="h-12 rounded-xl"
              />
            </div>
          )}

          {/* Payment Info & Deposit */}
          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl space-y-4 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">Precio del Servicio</span>
              <span className="text-lg font-bold text-slate-900 dark:text-white">
                ${selectedServicePrice.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="space-y-2">
              <Label htmlFor="deposit" className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Seña / Pago Adelantado
              </Label>
              <Input
                id="deposit"
                type="number"
                value={formData.deposit_amount}
                onChange={(e) => setFormData({ ...formData, deposit_amount: e.target.value })}
                placeholder="0.00"
                className="h-11 bg-white dark:bg-slate-900"
                min="0"
                max={selectedServicePrice}
              />
              <p className="text-[10px] text-slate-400">
                Si se ingresa un monto, se registrará como seña pagada.
              </p>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Notas
            </Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Notas adicionales sobre la cita..."
              rows={3}
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
                Agendando...
              </>
            ) : (
              <>
                <CalendarIcon className="size-4" />
                Confirmar Cita
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
