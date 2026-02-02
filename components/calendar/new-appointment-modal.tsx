"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Search, X, Calendar, Check, ChevronLeft, ChevronRight, Info, Bell } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { getPatients } from "@/lib/api/patients"
import { getServices } from "@/lib/api/services"
import { createAppointment } from "@/lib/api/appointments"
import type { Patient, Service } from "@/lib/supabase/client"

interface NewAppointmentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAppointmentCreated?: () => void
  initialPatientId?: string
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

export function NewAppointmentModal({ open, onOpenChange, onAppointmentCreated, initialPatientId, initialDate, initialTime }: NewAppointmentModalProps & NewAppointmentModalExtraProps) {
  const { profile } = useAuth()
  const [selectedDate, setSelectedDate] = useState<number | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [reminderEnabled, setReminderEnabled] = useState(true)
  const [deposit, setDeposit] = useState("0")
  const [patients, setPatients] = useState<Patient[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null)
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null)
  const [patientSearchText, setPatientSearchText] = useState("")
  const [showPatientDropdown, setShowPatientDropdown] = useState(false)
  const [loadingData, setLoadingData] = useState(false)
  const [calendarDate, setCalendarDate] = useState<Date>(new Date())
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Load patients and services when modal opens
  useEffect(() => {
    if (!open || !profile?.id) return
    
    const loadData = async () => {
      try {
        setLoadingData(true)
        const [patientsData, servicesData] = await Promise.all([
          getPatients(profile.id),
          getServices(profile.id)
        ])
        setPatients(patientsData || [])
        setServices(servicesData || [])
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoadingData(false)
      }
    }
    
    loadData()
  }, [open, profile?.id])

  // Initialize selected date/time when modal opens or props change
  useEffect(() => {
    if (!open) return
    if (initialDate) {
      const [year, month, day] = initialDate.split('-').map(Number)
      const d = new Date(year, month - 1, day)
      if (!isNaN(d.getTime())) {
        setSelectedDate(d.getDate())
        setCalendarDate(d)
      }
    } else {
      setCalendarDate(new Date())
    }
    if (initialTime) {
      const formatted = formatTimeToAmPm(initialTime)
      if (formatted) setSelectedTime(formatted)
    }

    // If modal opened with an initialPatientId, pre-select that patient
    if (initialPatientId) {
      setSelectedPatientId(initialPatientId)
      setPatientSearchText("")
      setShowPatientDropdown(false)
    }
  }, [open, initialDate, initialTime])

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      setSelectedPatientId(null)
      setSelectedServiceId(null)
      setPatientSearchText("")
      setShowPatientDropdown(false)
      setDeposit("0")
      if (!initialDate) setSelectedDate(null)
      if (!initialTime) setSelectedTime(null)
    }
  }, [open, initialDate, initialTime])

  // Filter patients based on search text
  const filteredPatients = patientSearchText.trim()
    ? patients.filter(p => 
        p.full_name?.toLowerCase().includes(patientSearchText.toLowerCase()) ||
        p.dni?.includes(patientSearchText)
      )
    : patients

  const selectedPatient = selectedPatientId 
    ? patients.find(p => p.id === selectedPatientId)
    : null

  const handleDepositChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value === '' || value === '-') {
      setDeposit('0')
    } else {
      const num = parseFloat(value)
      setDeposit(isNaN(num) || num < 0 ? '0' : value)
    }
  }

  // Format incoming time like "09:00" or "15:30" to modal slot format "09:00 AM"
  const formatTimeToAmPm = (time?: string) => {
    if (!time) return null
    const [hh, mm] = time.split(":").map(Number)
    if (isNaN(hh) || isNaN(mm)) return null
    const period = hh >= 12 ? 'PM' : 'AM'
    const hour12 = hh % 12 === 0 ? 12 : hh % 12
    return `${String(hour12).padStart(2, '0')}:${String(mm).padStart(2, '0')} ${period}`
  }

  // Generate calendar days for the current calendar month
  const getCalendarDays = () => {
    const year = calendarDate.getFullYear()
    const month = calendarDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const offset = (firstDay.getDay() + 6) % 7 // convert Sunday=0 to Monday=0
    const start = new Date(firstDay)
    start.setDate(start.getDate() - offset)
    
    const days = []
    for (let i = 0; i < 42; i++) {
      const d = new Date(start)
      d.setDate(start.getDate() + i)
      days.push(d)
    }
    return days
  }

  const handlePrevMonth = () => {
    setCalendarDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setCalendarDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
  }

  const handleSelectDay = (date: Date) => {
    setSelectedDate(date.getDate())
    setCalendarDate(date)
  }

  const calendarDays = getCalendarDays()
  const isCurrentMonth = (date: Date) => date.getMonth() === calendarDate.getMonth()

  // Convert time from AM/PM format to 24h format (HH:MM:SS)
  const convertTo24h = (ampmTime: string): string => {
    const [time, period] = ampmTime.split(' ')
    let [hours, minutes] = time.split(':').map(Number)
    
    if (period === 'PM' && hours !== 12) {
      hours += 12
    } else if (period === 'AM' && hours === 12) {
      hours = 0
    }
    
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`
  }

  // Calculate end time using service duration (minutes)
  const getEndTime = (startTime: string, durationMinutes: number = 60): string => {
    const parts = startTime.split(':').map(Number)
    const hours = parts[0] ?? 0
    const minutes = parts[1] ?? 0
    const startTotal = hours * 60 + minutes
    const endTotal = (startTotal + durationMinutes) % (24 * 60)
    const endHours = Math.floor(endTotal / 60)
    const endMins = endTotal % 60
    return `${String(endHours).padStart(2, '0')}:${String(endMins).padStart(2, '0')}:00`
  }

  const handleConfirmReservation = async () => {
    setErrorMessage(null)
    
    // Validation
    if (!selectedPatientId) {
      setErrorMessage('Por favor selecciona un paciente')
      return
    }
    if (!selectedServiceId) {
      setErrorMessage('Por favor selecciona un servicio')
      return
    }
    if (selectedDate === null) {
      setErrorMessage('Por favor selecciona una fecha')
      return
    }
    if (!selectedTime) {
      setErrorMessage('Por favor selecciona una hora')
      return
    }

    try {
      setIsSubmitting(true)
      
      // Format appointment data
      const appointmentDate = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), selectedDate)
      const dateStr = appointmentDate.toISOString().split('T')[0]
      const startTimeStr = convertTo24h(selectedTime)
      const service = services.find(s => s.id === selectedServiceId)
      const duration = service?.duration_minutes ?? 60
      const endTimeStr = getEndTime(startTimeStr, duration)

      const depositAmount = parseFloat(deposit) || 0
      const totalAmt = service?.price ?? 0
      const remaining = Math.max(0, totalAmt - depositAmount)
      const newAppointment = {
        professional_id: profile!.id,
        patient_id: selectedPatientId,
        service_id: selectedServiceId,
        appointment_date: dateStr,
        start_time: startTimeStr,
        end_time: endTimeStr,
        is_video_call: false,
        status: 'scheduled' as const,
        notes: '',
        total_amount: service?.price ?? null,
        deposit_amount: depositAmount,
        deposit_paid: depositAmount > 0,
        remaining_balance: remaining,
        balance_paid: remaining === 0,
        payment_status: depositAmount > 0 || remaining === 0 ? ('partial' as const) : ('unpaid' as const),
      }
      
      await createAppointment(newAppointment)
      
      // Success - close modal and refresh appointments
      if (onAppointmentCreated) {
        onAppointmentCreated()
      }
      onOpenChange(false)
    } catch (error: any) {
      console.error('Error creating appointment:', error)
      
      // Extract the specific error message from Supabase error
      let errorMsg = 'Error al crear la cita. Por favor intenta nuevamente.'
      
      if (error?.message) {
        errorMsg = error.message
      } else if (error?.error_description) {
        errorMsg = error.error_description
      } else if (typeof error === 'string') {
        errorMsg = error
      }
      
      setErrorMessage(errorMsg)
    } finally {
      setIsSubmitting(false)
    }
  }

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
              <div className="relative">
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground size-4 group-focus-within:text-primary transition-colors z-10" />
                  <Input
                    placeholder="Buscar paciente..."
                    className="pl-11 h-12 bg-background"
                    value={selectedPatient ? selectedPatient.full_name || '' : patientSearchText}
                    onChange={(e) => {
                      setPatientSearchText(e.target.value)
                      setSelectedPatientId(null)
                      setShowPatientDropdown(true)
                    }}
                    onFocus={() => setShowPatientDropdown(true)}
                  />
                  {selectedPatientId && (
                    <button
                      onClick={() => {
                        setSelectedPatientId(null)
                        setPatientSearchText("")
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <X className="size-4" />
                    </button>
                  )}
                </div>
                {showPatientDropdown && !selectedPatientId && patientSearchText.trim().length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-lg shadow-md z-50 max-h-48 overflow-y-auto">
                    {loadingData ? (
                      <div className="p-3 text-xs text-muted-foreground">Cargando...</div>
                    ) : filteredPatients.length > 0 ? (
                      filteredPatients.map((patient) => (
                        <button
                          key={patient.id}
                          onClick={() => {
                            setSelectedPatientId(patient.id)
                            setShowPatientDropdown(false)
                            setPatientSearchText("")
                          }}
                          className="w-full text-left p-3 hover:bg-muted transition-colors border-b last:border-0 text-sm"
                        >
                          <div className="font-semibold">{patient.full_name}</div>
                          {patient.dni && <div className="text-xs text-muted-foreground">DNI: {patient.dni}</div>}
                        </button>
                      ))
                    ) : (
                      <div className="p-3 text-xs text-muted-foreground">No se encontraron pacientes</div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="service" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {'Servicio'}
              </Label>
              <Select value={selectedServiceId || ""} onValueChange={setSelectedServiceId}>
                <SelectTrigger id="service" className="h-12 bg-background">
                  <SelectValue placeholder="Elegir servicio..." />
                </SelectTrigger>
                <SelectContent>
                  {loadingData ? (
                    <div className="p-3 text-xs text-muted-foreground">Cargando servicios...</div>
                  ) : services.length > 0 ? (
                    services.map((service) => (
                      <SelectItem key={service.id} value={service.id}>
                        {service.name}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="p-3 text-xs text-muted-foreground">No hay servicios disponibles</div>
                  )}
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
                    onChange={handleDepositChange}
                    placeholder="0.00"
                    className="pl-8 h-11 bg-background font-bold"
                    min="0"
                    step="0.01"
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
                  <span className="text-sm font-bold text-foreground">{calendarDate.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })}</span>
                  <div className="flex gap-1">
                    <button onClick={handlePrevMonth} className="size-7 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground">
                      <ChevronLeft className="size-4" />
                    </button>
                    <button onClick={handleNextMonth} className="size-7 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground">
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
                  {calendarDays.map((day, idx) => {
                    const isCurrent = isCurrentMonth(day)
                    const isSelected = selectedDate === day.getDate() && isCurrent
                    return (
                      <button
                        key={idx}
                        onClick={() => handleSelectDay(day)}
                        className={`aspect-square flex items-center justify-center text-xs font-semibold rounded-lg transition-all ${
                          !isCurrent
                            ? 'text-muted-foreground/30 cursor-default'
                            : isSelected
                            ? 'bg-primary text-white'
                            : 'hover:bg-background text-foreground'
                        }`}
                        disabled={!isCurrent}
                      >
                        {day.getDate()}
                      </button>
                    )
                  })}
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

          {/* Error Message */}
          {errorMessage && (
            <div className="bg-red-100 border border-red-300 text-red-800 p-3 rounded-lg text-sm">
              {errorMessage}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-6 border-t border-border bg-muted/30 flex flex-col-reverse sm:flex-row justify-end gap-3">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="text-muted-foreground hover:text-foreground"
            disabled={isSubmitting}
          >
            {'Cancelar'}
          </Button>
          <Button 
            onClick={handleConfirmReservation}
            disabled={isSubmitting}
            className="gap-2 shadow-lg shadow-primary/20"
          >
            <Check className="size-4" />
            {isSubmitting ? 'Creando...' : 'Confirmar Reserva'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
