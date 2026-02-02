"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { updateAppointment } from "@/lib/api/appointments"
import type { Appointment } from "@/lib/supabase/client"

interface EditAppointmentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  appointment: (Appointment & { service?: { duration_minutes?: number } }) | null
  onUpdated?: (updated: Appointment) => void
}

export function EditAppointmentModal({ open, onOpenChange, appointment, onUpdated }: EditAppointmentModalProps) {
  const [date, setDate] = useState<string>('')
  const [startTime, setStartTime] = useState<string>('')
  const [endTime, setEndTime] = useState<string>('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!appointment) return
    setDate(appointment.appointment_date)
    // appointment.start_time may include seconds -> keep HH:MM
    setStartTime(appointment.start_time ? appointment.start_time.substring(0,5) : '')
    setEndTime(appointment.end_time ? appointment.end_time.substring(0,5) : '')
  }, [appointment])

  useEffect(() => {
    // If endTime not set but service duration available, calculate endTime from startTime
    if (!startTime || !appointment) return
    if (appointment.service?.duration_minutes && (!endTime || endTime === '')) {
      const [hh, mm] = startTime.split(':').map(Number)
      const startMinutes = hh * 60 + mm
      const endMinutes = (startMinutes + (appointment.service.duration_minutes || 60)) % (24 * 60)
      const endH = Math.floor(endMinutes / 60)
      const endM = endMinutes % 60
      setEndTime(`${String(endH).padStart(2,'0')}:${String(endM).padStart(2,'0')}`)
    }
  }, [startTime, appointment])

  if (!open || !appointment) return null

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const updates: Partial<Appointment> = {
        appointment_date: date,
        start_time: `${startTime}:00`,
        end_time: `${endTime}:00`,
      }
      const updated = await updateAppointment(appointment.id, updates)
      if (onUpdated) onUpdated(updated)
      onOpenChange(false)
    } catch (err) {
      console.error('Error updating appointment:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Editar Cita</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs uppercase">Fecha</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs uppercase">Hora inicio</Label>
              <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs uppercase">Hora fin</Label>
              <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={loading}>Cancelar</Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? <Loader2 className="animate-spin" /> : 'Guardar'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
