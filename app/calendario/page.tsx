'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from '@/components/dashboard/sidebar'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Plus, Loader2, Calendar as CalendarIcon } from 'lucide-react'
import { NewAppointmentModal } from '@/components/calendar/new-appointment-modal'
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
  const [view, setView] = useState<'day' | 'week'>('week')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [appointments, setAppointments] = useState<AppointmentWithRelations[]>([])
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())

  useEffect(() => {
    if (profile?.id) {
      loadAppointments()
    }
  }, [profile, currentDate])

  const loadAppointments = async () => {
    if (!profile?.id) return

    try {
      setLoading(true)
      const startOfWeek = new Date(currentDate)
      startOfWeek.setDate(currentDate.getDate() - currentDate.getDay() + 1) // Monday

      const endOfWeek = new Date(startOfWeek)
      endOfWeek.setDate(startOfWeek.getDate() + 6) // Sunday

      const data = await getAppointments(
        profile.id,
        startOfWeek.toISOString().split('T')[0],
        endOfWeek.toISOString().split('T')[0]
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

  const weekDays = getWeekDays()
  const timeSlots = Array.from({ length: 13 }, (_, i) => i + 8) // 8:00 to 20:00

  const getAppointmentsForDay = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    return appointments.filter(apt => apt.appointment_date === dateStr)
  }

  const goToPrevWeek = () => {
    const newDate = new Date(currentDate)
    newDate.setDate(currentDate.getDate() - 7)
    setCurrentDate(newDate)
  }

  const goToNextWeek = () => {
    const newDate = new Date(currentDate)
    newDate.setDate(currentDate.getDate() + 7)
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
                      Semana del {weekDays[0].getDate()} al {weekDays[6].getDate()}
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
                </div>

                <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 h-10 md:h-11 font-bold shadow-lg text-sm">
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
              {/* Week Days Header */}
              <div className="grid grid-cols-8 border-b border-border bg-muted/30 sticky top-0 z-10">
                <div className="border-r border-border p-3"></div>
                {weekDays.map((day, index) => {
                  const isToday = day.toDateString() === new Date().toDateString()
                  const isWeekend = day.getDay() === 0 || day.getDay() === 6
                  return (
                    <div
                      key={index}
                      className={`p-3 text-center border-r border-border ${isWeekend ? 'bg-muted/50' : ''
                        }`}
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

              {/* Time Slots */}
              <div className="grid grid-cols-8">
                {timeSlots.map((hour) => (
                  <div key={hour} className="contents">
                    <div className="border-r border-b border-border p-2 text-right text-xs text-muted-foreground font-medium bg-muted/10">
                      {String(hour).padStart(2, '0')}:00
                    </div>
                    {weekDays.map((day, dayIndex) => {
                      const dayAppointments = getAppointmentsForDay(day)
                      const hourAppointments = dayAppointments.filter(apt => {
                        const startHour = parseInt(apt.start_time.split(':')[0])
                        return startHour === hour
                      })
                      const isWeekend = day.getDay() === 0 || day.getDay() === 6

                      return (
                        <div
                          key={`${hour}-${dayIndex}`}
                          className={`border-r border-b border-border min-h-[60px] p-1 ${isWeekend ? 'bg-muted/20' : 'bg-white'
                            }`}
                        >
                          {hourAppointments.map((apt) => (
                            <div
                              key={apt.id}
                              className={`p-2 rounded-lg text-xs ${apt.service?.color === 'blue' ? 'bg-blue-100 border-l-4 border-blue-500 text-blue-900' :
                                  apt.service?.color === 'emerald' ? 'bg-emerald-100 border-l-4 border-emerald-500 text-emerald-900' :
                                    apt.service?.color === 'purple' ? 'bg-purple-100 border-l-4 border-purple-500 text-purple-900' :
                                      apt.service?.color === 'amber' ? 'bg-amber-100 border-l-4 border-amber-500 text-amber-900' :
                                        'bg-primary/10 border-l-4 border-primary text-primary'
                                } mb-1`}
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
            </div>
          </div>
        </main>

        <NewAppointmentModal
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          onAppointmentCreated={loadAppointments}
        />
      </div>
    </ProtectedRoute>
  )
}
