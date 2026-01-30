"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Search, X, Calendar, Check, ChevronLeft, ChevronRight, Info, Bell } from "lucide-react"

interface NewAppointmentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAppointmentCreated?: () => void
}

interface NewAppointmentModalExtraProps {
  initialDate?: string
  initialTime?: string
}

const timeSlots = [
  "09:00 AM",
  "10:00 AM",
  "11:30 AM",
  "12:30 PM",
  "03:00 PM",
  "04:00 PM",
  "05:00 PM",
  "06:00 PM",
]

export function NewAppointmentModal({ open, onOpenChange, initialDate, initialTime }: NewAppointmentModalProps & NewAppointmentModalExtraProps) {
  const [selectedDate, setSelectedDate] = useState<number | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [reminderEnabled, setReminderEnabled] = useState(true)
  const [deposit, setDeposit] = useState("0")

  // Format incoming time like "09:00" or "15:30" to modal slot format "09:00 AM"
  const formatTimeToAmPm = (time?: string) => {
    if (!time) return null
    const [hh, mm] = time.split(":").map(Number)
    if (isNaN(hh) || isNaN(mm)) return null
    const period = hh >= 12 ? 'PM' : 'AM'
    const hour12 = hh % 12 === 0 ? 12 : hh % 12
    return `${String(hour12).padStart(2, '0')}:${String(mm).padStart(2, '0')} ${period}`
  }

  // Initialize selected date/time when modal opens or props change
  useEffect(() => {
    if (!open) return
    if (initialDate) {
      const d = new Date(initialDate)
      if (!isNaN(d.getTime())) setSelectedDate(d.getDate())
    }
    if (initialTime) {
      const formatted = formatTimeToAmPm(initialTime)
      if (formatted) setSelectedTime(formatted)
    }
  }, [open, initialDate, initialTime])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[95vh] p-0 flex flex-col overflow-hidden">
        {/* Header */}
        <DialogHeader className="px-4 md:px-8 py-4 md:py-6 border-b border-border shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 text-primary size-9 md:size-10 rounded-xl flex items-center justify-center">
                <Calendar className="size-4 md:size-5" />
              </div>
              <div>
                <DialogTitle className="text-lg md:text-xl font-bold text-foreground">
                  {"Programar Cita"}
                </DialogTitle>
                <p className="text-muted-foreground text-[10px] md:text-xs font-medium">
                  {"Nueva reserva de atención"}
                </p>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-4 md:space-y-6">
          {/* Patient and Service Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {'Paciente'}
              </Label>
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground size-4 group-focus-within:text-primary transition-colors" />
                <Input
                  placeholder="Seleccionar paciente..."
                  className="pl-11 h-12 bg-background"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="service" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {'Servicio'}
              </Label>
              <Select>
                <SelectTrigger id="service" className="h-12 bg-background">
                  <SelectValue placeholder="Elegir servicio..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="terapia">{'Terapia Individual'}</SelectItem>
                  <SelectItem value="consulta">{'Consulta Inicial'}</SelectItem>
                  <SelectItem value="seguimiento">{'Seguimiento Clínico'}</SelectItem>
                  <SelectItem value="evaluacion">{'Evaluación Diagnóstica'}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Deposit Configuration */}
          <div className="bg-muted/50 p-5 rounded-2xl border border-border space-y-4">
            <div className="flex items-center gap-2">
              <div className="bg-primary text-white size-5 rounded flex items-center justify-center">
                <span className="text-xs font-bold">{'$'}</span>
              </div>
              <h3 className="text-sm font-bold text-foreground">{'Configuración de Seña'}</h3>
            </div>

            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
              <div className="w-full md:w-1/3">
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-semibold">
                    {'$'}
                  </span>
                  <Input
                    type="number"
                    value={deposit}
                    onChange={(e) => setDeposit(e.target.value)}
                    placeholder="0.00"
                    className="pl-8 h-11 bg-background font-bold"
                  />
                </div>
              </div>

              <div className="flex-1 flex items-start gap-3 bg-primary/5 p-3 rounded-lg">
                <Info className="text-primary size-5 mt-0.5 shrink-0" />
                <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                  {'El monto de la seña se registrará como un pago adelantado y se '}
                  <span className="text-primary font-bold">{'descontará automáticamente'}</span>
                  {' del total final al momento de facturar el servicio.'}
                </p>
              </div>
            </div>
          </div>

          {/* Date and Time Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Calendar */}
            <div className="space-y-3">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {'Seleccionar Fecha'}
              </Label>
              <div className="bg-muted/50 border border-border rounded-2xl p-4">
                <div className="flex items-center justify-between mb-4 px-1">
                  <span className="text-sm font-bold text-foreground">{'Octubre 2023'}</span>
                  <div className="flex gap-1">
                    <button className="size-7 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground">
                      <ChevronLeft className="size-4" />
                    </button>
                    <button className="size-7 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground">
                      <ChevronRight className="size-4" />
                    </button>
                  </div>
                </div>

                {/* Calendar Header */}
                <div className="grid grid-cols-7 text-center text-[10px] font-bold text-muted-foreground mb-2 uppercase tracking-tighter">
                  <span>{'Lu'}</span>
                  <span>{'Ma'}</span>
                  <span>{'Mi'}</span>
                  <span>{'Ju'}</span>
                  <span>{'Vi'}</span>
                  <span>{'Sa'}</span>
                  <span>{'Do'}</span>
                </div>

                {/* Calendar Days */}
                <div className="grid grid-cols-7 gap-1">
                  {[25, 26, 27, 28, 29, 30].map((day) => (
                    <div
                      key={`prev-${day}`}
                      className="aspect-square flex items-center justify-center text-xs text-muted-foreground/30"
                    >
                      {day}
                    </div>
                  ))}
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((day) => (
                    <button
                      key={day}
                      onClick={() => setSelectedDate(day)}
                      className={`aspect-square flex items-center justify-center text-xs font-semibold rounded-lg transition-all ${
                        selectedDate === day
                          ? "bg-primary text-white"
                          : "hover:bg-background text-foreground"
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Time Slots */}
            <div className="space-y-3">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {'Horarios Disponibles'}
              </Label>
              <div className="grid grid-cols-2 gap-2 max-h-[220px] overflow-y-auto pr-2">
                {timeSlots.map((time) => (
                  <button
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    className={`py-2.5 px-3 rounded-xl border text-sm font-semibold transition-all ${
                      selectedTime === time
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border text-muted-foreground hover:border-primary hover:text-primary"
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Reminder Toggle */}
          <div className="bg-muted/50 p-4 rounded-xl border border-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <Bell className="size-4" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">{'Recordatorio de Cita'}</p>
                <p className="text-xs text-muted-foreground">
                  {'Se enviará un email 24h antes de la sesión.'}
                </p>
              </div>
            </div>
            <Switch checked={reminderEnabled} onCheckedChange={setReminderEnabled} />
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 border-t border-border bg-muted/30 flex flex-col-reverse sm:flex-row justify-end gap-3">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="text-muted-foreground hover:text-foreground"
          >
            {'Cancelar'}
          </Button>
          <Button className="gap-2 shadow-lg shadow-primary/20">
            <Check className="size-4" />
            {'Confirmar Reserva'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
