'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from '@/components/dashboard/sidebar'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Plus, Loader2, Calendar as CalendarIcon } from 'lucide-react'
import { NewAppointmentModal } from '@/components/calendar/new-appointment-modal'
import { AppointmentDetailModal } from '@/components/calendar/appointment-detail-modal'
import { EditAppointmentModal } from '@/components/calendar/edit-appointment-modal'
import ProtectedRoute from '@/components/protected-route'
import { useAuth } from '@/lib/auth-context'
import { getAppointments } from '@/lib/api/appointments'
import type { Appointment } from '@/lib/supabase/client'

type AppointmentWithRelations = Appointment & {
  patient: { full_name: string } | null
  service: { name: string; color: string } | null
}

export default function CalendarioPage() {
  const { profile } = useAuth()
  const [view, setView] = useState<'day' | 'week' | 'month'>('week')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalInitialDate, setModalInitialDate] = useState<string | undefined>(undefined)
  const [modalInitialTime, setModalInitialTime] = useState<string | undefined>(undefined)
  const [appointments, setAppointments] = useState<AppointmentWithRelations[]>([])
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentWithRelations | null>(null)
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [appointmentToEdit, setAppointmentToEdit] = useState<AppointmentWithRelations | null>(null)

  useEffect(() => {
    if (profile?.id) {
      loadAppointments()
    }
  }, [profile, currentDate, view])

  const loadAppointments = async () => {
    if (!profile?.id) return

    try {
      setLoading(true)
      let start: Date
      let end: Date

      if (view === 'day') {
        start = new Date(currentDate)
        end = new Date(currentDate)
      } else if (view === 'week') {
        start = new Date(currentDate)
        start.setDate(currentDate.getDate() - currentDate.getDay() + 1) // Monday
        end = new Date(start)
        end.setDate(start.getDate() + 6)
      } else {
        // month
        start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
        end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
      }

      const data = await getAppointments(
        profile.id,
        start.toISOString().split('T')[0],
        end.toISOString().split('T')[0]
      ) as AppointmentWithRelations[]

      setAppointments(data)
    } catch (error) {
      console.error('Error loading appointments:', error)
    } finally {
      setLoading(false)
    }
  }

  const getWeekDays = () => {
    const startOfWeek = new Date(currentDate)
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay() + 1)

    const days = []
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek)
      day.setDate(startOfWeek.getDate() + i)
      days.push(day)
    }
    return days
  }

  const getMonthGrid = () => {
    const firstOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
    const offset = (firstOfMonth.getDay() + 6) % 7 // convert Sunday=0 to position 6 if treating Monday as first
    const start = new Date(firstOfMonth)
    start.setDate(1 - offset)

    const days: Date[] = []
    for (let i = 0; i < 42; i++) {
      const d = new Date(start)
      d.setDate(start.getDate() + i)
      days.push(d)
    }
    return days
  }

  const weekDays = getWeekDays()
  const visibleDays = view === 'day' ? [currentDate] : weekDays
  const gridColumns = visibleDays.length // number of day columns (time column handled separately)
  const timeSlots = Array.from({ length: 13 }, (_, i) => i + 8) // 8:00 to 20:00

  const getAppointmentsForDay = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    return appointments.filter(apt => apt.appointment_date === dateStr && apt.status !== 'cancelled')
  }

  const goToPrevWeek = () => {
    const newDate = new Date(currentDate)
    if (view === 'day') newDate.setDate(currentDate.getDate() - 1)
    else if (view === 'week') newDate.setDate(currentDate.getDate() - 7)
    else newDate.setMonth(currentDate.getMonth() - 1)
    setCurrentDate(newDate)
  }

  const goToNextWeek = () => {
    const newDate = new Date(currentDate)
    if (view === 'day') newDate.setDate(currentDate.getDate() + 1)
    else if (view === 'week') newDate.setDate(currentDate.getDate() + 7)
    else newDate.setMonth(currentDate.getMonth() + 1)
    setCurrentDate(newDate)
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="flex h-screen overflow-hidden">
        <Sidebar currentPage="calendario" />

        <main className="flex-1 flex flex-col overflow-hidden bg-white pt-16 lg:pt-0">
          {/* Header */}
          <header className="bg-white border-b border-border px-4 md:px-10 py-4 md:py-6">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 md:gap-8">
                  <div className="flex flex-col">
                    <h2 className="text-xl md:text-2xl font-extrabold text-foreground tracking-tight">
                      {currentDate.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })}
                    </h2>
                    <p className="text-[10px] md:text-xs font-medium text-muted-foreground uppercase tracking-widest mt-0.5">
                      {view === 'week' ? (
                        <>Semana del {weekDays[0].getDate()} al {weekDays[6].getDate()}</>
                      ) : view === 'day' ? (
                        <>{currentDate.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'short' })}</>
                      ) : (
                        <>Mes de {currentDate.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })}</>
                      )}
                    </p>
                  </div>

                  <div className="flex items-center bg-muted rounded-xl p-1 border border-border">
                    <button
                      onClick={goToPrevWeek}
                      className="p-1.5 md:p-2 hover:bg-background rounded-lg transition-all text-muted-foreground"
                    >
                      <ChevronLeft className="size-4 md:size-5" />
                    </button>
                    <button
                      onClick={goToToday}
                      className="px-2 md:px-3 text-xs md:text-sm font-bold text-foreground hover:bg-background rounded-lg transition-all"
                    >
                      Hoy
                    </button>
                    <button
                      onClick={goToNextWeek}
                      className="p-1.5 md:p-2 hover:bg-background rounded-lg transition-all text-muted-foreground"
                    >
                      <ChevronRight className="size-4 md:size-5" />
                    </button>
                  </div>
                  <div className="flex items-center gap-1 ml-2">
                    <button
                      onClick={() => setView('day')}
                      className={`px-2 py-1 rounded ${view === 'day' ? 'bg-primary text-white' : 'bg-transparent text-muted-foreground hover:bg-background'}`}
                    >Día</button>
                    <button
                      onClick={() => setView('week')}
                      className={`px-2 py-1 rounded ${view === 'week' ? 'bg-primary text-white' : 'bg-transparent text-muted-foreground hover:bg-background'}`}
                    >Semana</button>
                    <button
                      onClick={() => setView('month')}
                      className={`px-2 py-1 rounded ${view === 'month' ? 'bg-primary text-white' : 'bg-transparent text-muted-foreground hover:bg-background'}`}
                    >Mes</button>
                  </div>
                </div>

                <Button onClick={() => { setModalInitialDate(undefined); setModalInitialTime(undefined); setIsModalOpen(true); }} className="flex items-center gap-2 h-10 md:h-11 font-bold shadow-lg text-sm">
                  <Plus className="size-4" />
                  <span className="hidden sm:inline">Nueva Cita</span>
                  <span className="sm:hidden">Nueva</span>
                </Button>
              </div>
            </div>
          </header>

          {/* Calendar Grid */}
          <div className="flex-1 overflow-auto">
            <div className="min-w-[800px]">
              {view === 'month' ? (
                // Monthly grid
                <div>
                  <div className="grid grid-cols-7 border-b border-border bg-muted/30 sticky top-0 z-10">
                    {['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do'].map((w) => (
                      <div key={w} className="p-3 text-center border-r border-border">
                        <div className="text-xs font-bold uppercase text-muted-foreground">{w}</div>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 gap-1 p-3">
                    {getMonthGrid().map((day, idx) => {
                      const isCurrentMonth = day.getMonth() === currentDate.getMonth()
                      const isToday = day.toDateString() === new Date().toDateString()
                      const dayAppointments = getAppointmentsForDay(day)
                      return (
                        <button
                          key={idx}
                          onClick={() => {
                            setModalInitialDate(day.toISOString().split('T')[0])
                            setModalInitialTime('09:00')
                            setIsModalOpen(true)
                          }}
                          className={`p-3 min-h-[90px] text-left rounded-lg border border-border ${isCurrentMonth ? 'bg-white' : 'bg-muted/10 text-muted-foreground/60'} ${isToday ? 'ring-2 ring-primary' : ''}`}
                        >
                          <div className="text-sm font-bold">{day.getDate()}</div>
                          <div className="mt-2 space-y-1">
                            {dayAppointments.slice(0, 2).map((apt) => (
                              <div key={apt.id} className="text-xs truncate text-muted-foreground">{apt.start_time.substring(0,5)} - {apt.patient?.full_name}</div>
                            ))}
                            {dayAppointments.length > 2 && <div className="text-xs text-muted-foreground">+{dayAppointments.length - 2} más</div>}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              ) : (
                // Day or Week view (time grid)
                <>
                  <div className="grid border-b border-border bg-muted/30 sticky top-0 z-10" style={{ gridTemplateColumns: `120px repeat(${gridColumns}, minmax(0, 1fr))` }}>
                    <div className="border-r border-border p-3"></div>
                    {visibleDays.map((day, index) => {
                      const isToday = day.toDateString() === new Date().toDateString()
                      const isWeekend = day.getDay() === 0 || day.getDay() === 6
                      return (
                        <div
                          key={index}
                          className={`p-3 text-center border-r border-border ${isWeekend ? 'bg-muted/50' : ''}`}
                        >
                          <div className={`text-xs font-bold uppercase ${isToday ? 'text-primary' : 'text-muted-foreground'}`}>
                            {day.toLocaleDateString('es-AR', { weekday: 'short' })}
                          </div>
                          <div className={`text-lg font-black mt-1 ${isToday ? 'text-primary' : 'text-foreground'}`}>
                            {day.getDate()}
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  <div className="grid" style={{ gridTemplateColumns: `120px repeat(${gridColumns}, minmax(0, 1fr))` }}>
                    {timeSlots.map((hour) => (
                      <div key={hour} className="contents">
                        <div className="border-r border-b border-border p-2 text-right text-xs text-muted-foreground font-medium bg-muted/10">
                          {String(hour).padStart(2, '0')}:00
                        </div>
                        {visibleDays.map((day, dayIndex) => {
                          const dayAppointments = getAppointmentsForDay(day)
                          const hourAppointments = dayAppointments.filter(apt => {
                            const startHour = parseInt(apt.start_time.split(':')[0])
                            return startHour === hour
                          })
                          const isWeekend = day.getDay() === 0 || day.getDay() === 6

                          return (
                            <div
                              key={`${hour}-${dayIndex}`}
                              className={`border-r border-b border-border min-h-[60px] p-1 cursor-pointer ${isWeekend ? 'bg-muted/20' : 'bg-white'} flex flex-col gap-1`}
                              onClick={() => {
                                if (hourAppointments.length === 0) {
                                  const dateStr = day.toISOString().split('T')[0]
                                  setModalInitialDate(dateStr)
                                  setModalInitialTime(`${String(hour).padStart(2,'0')}:00`)
                                  setIsModalOpen(true)
                                }
                              }}
                            >
                              {hourAppointments.map((apt) => (
                                <div
                                  key={apt.id}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setSelectedAppointment(apt)
                                    setDetailModalOpen(true)
                                  }}
                                  className={`p-2 rounded-lg text-xs flex-1 cursor-pointer hover:shadow-md transition-shadow ${apt.service?.color === 'blue' ? 'bg-blue-100 border-l-4 border-blue-500 text-blue-900' :
                                      apt.service?.color === 'emerald' ? 'bg-emerald-100 border-l-4 border-emerald-500 text-emerald-900' :
                                        apt.service?.color === 'purple' ? 'bg-purple-100 border-l-4 border-purple-500 text-purple-900' :
                                          apt.service?.color === 'amber' ? 'bg-amber-100 border-l-4 border-amber-500 text-amber-900' :
                                            'bg-primary/10 border-l-4 border-primary text-primary'
                                    }`}
                                >
                                  <div className="font-bold truncate">{apt.patient?.full_name}</div>
                                  <div className="text-[10px] opacity-80 truncate">{apt.service?.name}</div>
                                  <div className="text-[10px] opacity-60">{apt.start_time.substring(0, 5)}</div>
                                </div>
                              ))}
                            </div>
                          )
                        })}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </main>

        <NewAppointmentModal
          open={isModalOpen}
          onOpenChange={(open) => {
            setIsModalOpen(open)
            if (!open) {
              setModalInitialDate(undefined)
              setModalInitialTime(undefined)
            }
          }}
          onAppointmentCreated={loadAppointments}
          initialDate={modalInitialDate}
          initialTime={modalInitialTime}
        />

        <AppointmentDetailModal
          open={detailModalOpen}
          onOpenChange={setDetailModalOpen}
          appointment={selectedAppointment}
          onAppointmentUpdated={loadAppointments}
          onEdit={(apt) => {
            setAppointmentToEdit(apt)
            setEditModalOpen(true)
            // keep detail modal open so edits can be reflected in hot-update
          }}
        />

        <EditAppointmentModal
          open={editModalOpen}
          onOpenChange={(open) => setEditModalOpen(open)}
          appointment={appointmentToEdit}
          onUpdated={(updated) => {
            // Refresh list and update selected appointment in-place so detail shows changes immediately
            loadAppointments()
            setSelectedAppointment((prev) => {
              if (!prev) return prev
              if (prev.id === updated.id) return { ...prev, ...updated }
              return prev
            })
            setAppointmentToEdit(null)
            setEditModalOpen(false)
            setDetailModalOpen(true)
          }}
        />
      </div>
    </ProtectedRoute>
  )
}
