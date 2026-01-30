'use client'

import { useEffect, useState } from 'react'
import { Sidebar } from "@/components/dashboard/sidebar"
import { DashboardHeader } from "@/components/dashboard/header"
import ProtectedRoute from "@/components/protected-route"
import { useAuth } from "@/lib/auth-context"
import { getTodayAppointments } from "@/lib/api/appointments"
import { getBillingStats } from "@/lib/api/sales"
import { getRecentActivity } from "@/lib/api/activity"
import { Loader2, CreditCard, CalendarDays, Clock, MessageCircle, Eye } from "lucide-react"

export default function Dashboard() {
  const { profile } = useAuth()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    monthlyTotal: 0,
    dailyTotal: 0,
    pendingTotal: 0,
    dailySessionCount: 0,
    pendingCount: 0,
  })
  const [todayAppointments, setTodayAppointments] = useState<any[]>([])
  const [recentActivity, setRecentActivity] = useState<any[]>([])

  useEffect(() => {
    if (profile?.id) {
      loadDashboardData()
    }
  }, [profile?.id]) // Only re-run when profile ID actually changes

  const loadDashboardData = async () => {
    if (!profile?.id) return

    try {
      setLoading(true)
      const [statsData, appointments, activity] = await Promise.all([
        getBillingStats(profile.id),
        getTodayAppointments(profile.id),
        getRecentActivity(profile.id, 5),
      ])

      setStats(statsData)
      setTodayAppointments(appointments)
      setRecentActivity(activity)
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
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
        <Sidebar currentPage="dashboard" />
        <main className="flex-1 flex flex-col overflow-y-auto bg-background pt-16 lg:pt-0">
          <DashboardHeader />

          {/* Stats Section */}
          <section className="max-w-[1200px] w-full mx-auto px-4 md:px-6 mb-6 md:mb-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
              {/* Monthly Billing */}
              <div className="bg-card p-4 md:p-6 rounded-xl border border-border shadow-sm">
                <div className="flex items-center justify-between mb-3 md:mb-4">
                  <div className="size-9 md:size-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <CreditCard className="size-4 md:size-5" />
                  </div>
                  <span className="text-[10px] md:text-xs font-bold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full">
                    Este mes
                  </span>
                </div>
                <p className="text-muted-foreground text-xs md:text-sm font-medium">Facturación del Mes</p>
                <h3 className="text-xl md:text-2xl font-bold text-foreground">
                  ${stats.monthlyTotal.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                </h3>
              </div>

              {/* Daily Billing */}
              <div className="bg-card p-4 md:p-6 rounded-xl border border-border shadow-sm">
                <div className="flex items-center justify-between mb-3 md:mb-4">
                  <div className="size-9 md:size-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                    <CalendarDays className="size-4 md:size-5" />
                  </div>
                  <span className="text-[10px] md:text-xs font-bold text-muted-foreground bg-transparent px-2 py-0.5 rounded-full">
                    {stats.dailySessionCount} sesiones hoy
                  </span>
                </div>
                <p className="text-muted-foreground text-xs md:text-sm font-medium">Facturación del Día</p>
                <h3 className="text-xl md:text-2xl font-bold text-foreground">
                  ${stats.dailyTotal.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                </h3>
              </div>

              {/* Pending Payments */}
              <div className="bg-card p-4 md:p-6 rounded-xl border border-border shadow-sm">
                <div className="flex items-center justify-between mb-3 md:mb-4">
                  <div className="size-9 md:size-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                    <Clock className="size-4 md:size-5" />
                  </div>
                  <span className="text-[10px] md:text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                    {stats.pendingCount} Pendientes
                  </span>
                </div>
                <p className="text-muted-foreground text-xs md:text-sm font-medium">Pagos Pendientes</p>
                <h3 className="text-xl md:text-2xl font-bold text-foreground">
                  ${stats.pendingTotal.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                </h3>
              </div>
            </div>
          </section>

          {/* Main Content Grid */}
          <section className="max-w-[1200px] w-full mx-auto px-4 md:px-6 pb-8 md:pb-12 grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
            {/* Left Column - Appointments */}
            <div className="lg:col-span-2 space-y-4 md:space-y-6">
              {/* Today's Appointments */}
              <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                <div className="p-4 md:p-5 border-b border-border flex items-center justify-between">
                  <h4 className="font-bold text-foreground flex items-center gap-2 text-sm md:text-base">
                    <Clock className="size-4 md:size-5 text-primary" />
                    <span className="hidden sm:inline">Próximas Citas (Hoy)</span>
                    <span className="sm:hidden">Citas de Hoy</span>
                  </h4>
                  <a href="/calendario" className="text-xs font-semibold text-primary hover:underline">
                    Ver todas
                  </a>
                </div>
                <div className="divide-y divide-border">
                  {todayAppointments.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground text-sm">
                      No hay citas programadas para hoy
                    </div>
                  ) : (
                    todayAppointments.map((appointment: any) => (
                      <div
                        key={appointment.id}
                        className="p-3 md:p-4 flex items-center justify-between hover:bg-muted/50 transition-colors gap-2"
                      >
                        <div className="flex items-center gap-2 md:gap-4 min-w-0 flex-1">
                          <div className="flex flex-col items-center justify-center bg-muted rounded-lg px-2 md:px-3 py-1 text-center min-w-[56px] md:min-w-[70px] shrink-0">
                            <span className="text-[11px] md:text-xs font-bold text-primary">
                              {appointment.start_time.substring(0, 5)}
                            </span>
                            <span className="text-[9px] md:text-[10px] text-muted-foreground font-medium">
                              {appointment.service?.duration_minutes || 60} min
                            </span>
                          </div>
                          <div className="flex items-center gap-2 md:gap-3 min-w-0">
                            <div className="size-8 md:size-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[10px] md:text-xs shrink-0">
                              {appointment.patient?.full_name?.substring(0, 2).toUpperCase() || 'PA'}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs md:text-sm font-semibold text-foreground truncate">
                                {appointment.patient?.full_name || 'Paciente'}
                              </p>
                              <p className="text-[10px] md:text-xs text-muted-foreground truncate">
                                {appointment.service?.name || 'Consulta'}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 md:gap-2 shrink-0">
                          {appointment.patient?.phone && (
                            <a
                              href={`https://wa.me/${appointment.patient.phone.replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="size-7 md:size-8 rounded-lg bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:hover:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center transition-colors"
                              title="Enviar WhatsApp"
                            >
                              <MessageCircle className="w-3.5 h-3.5 md:w-4 md:h-4" />
                            </a>
                          )}
                          <a
                            href={`/pacientes/${appointment.patient?.id}`}
                            className="size-7 md:size-8 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary flex items-center justify-center transition-colors"
                            title="Ver detalle del paciente"
                          >
                            <Eye className="w-3.5 h-3.5 md:w-4 md:h-4" />
                          </a>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Activity Feed */}
            <div className="lg:col-span-1">
              <div className="bg-card rounded-xl border border-border shadow-sm h-full flex flex-col">
                <div className="p-4 md:p-5 border-b border-border">
                  <h4 className="font-bold text-foreground flex items-center gap-2 text-sm md:text-base">
                    Actividad Reciente
                  </h4>
                </div>
                <div className="p-4 md:p-5 flex-1 space-y-5 md:space-y-6 overflow-y-auto">
                  {recentActivity.length === 0 ? (
                    <div className="text-center text-muted-foreground text-sm py-8">
                      No hay actividad reciente
                    </div>
                  ) : (
                    recentActivity.map((activity, index) => (
                      <div key={activity.id} className="flex gap-2.5 md:gap-3 relative">
                        {index < recentActivity.length - 1 && (
                          <div className="absolute left-[14px] md:left-[17px] top-8 md:top-10 bottom-[-16px] md:bottom-[-20px] w-px bg-border" />
                        )}
                        <div className="size-7 md:size-[34px] rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 z-10">
                          <span className="text-xs">✓</span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs md:text-sm text-foreground font-medium">{activity.title}</p>
                          <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5 truncate">
                            {activity.description}
                          </p>
                          <span className="text-[9px] md:text-[10px] text-muted-foreground font-medium">
                            {new Date(activity.created_at).toLocaleDateString('es-AR')}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </ProtectedRoute>
  )
}
