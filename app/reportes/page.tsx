'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from '@/components/dashboard/sidebar'
import { CreditCard, CalendarCheck, CalendarX, Clock, Loader2, DollarSign } from 'lucide-react'
import ProtectedRoute from '@/components/protected-route'
import { useAuth } from '@/lib/auth-context'
import { getBillingStats, getCurrentMonthSales, getSales } from '@/lib/api/sales'
import type { Sale } from '@/lib/supabase/client'

type SaleWithRelations = Sale & {
  patient: { full_name: string } | null
  service: { name: string } | null
}

export default function ReportesPage() {
  const { profile } = useAuth()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    monthlyTotal: 0,
    dailyTotal: 0,
    pendingTotal: 0,
    dailySessionCount: 0,
    pendingCount: 0,
  })
  const [recentSales, setRecentSales] = useState<SaleWithRelations[]>([])

  useEffect(() => {
    if (profile?.id) {
      loadReportsData()
    }
  }, [profile])

  const loadReportsData = async () => {
    if (!profile?.id) return

    try {
      setLoading(true)
      const [statsData, salesData] = await Promise.all([
        getBillingStats(profile.id),
        getCurrentMonthSales(profile.id),
      ])

      setStats(statsData)
      setRecentSales(salesData as SaleWithRelations[])
    } catch (error) {
      console.error('Error loading reports data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getInitials = (name: string) => {
    const names = name.split(' ')
    return names.length > 1
      ? `${names[0][0]}${names[1][0]}`.toUpperCase()
      : name.substring(0, 2).toUpperCase()
  }

  const getColorClass = (index: number) => {
    const colors = ['bg-blue-100 text-blue-700', 'bg-purple-100 text-purple-700', 'bg-orange-100 text-orange-700', 'bg-emerald-100 text-emerald-700']
    return colors[index % colors.length]
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

  const statsCards = [
    {
      icon: CreditCard,
      label: "Facturación Mensual",
      value: `$${stats.monthlyTotal.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`,
      color: "blue",
    },
    {
      icon: CalendarCheck,
      label: "Total Sesiones",
      value: recentSales.filter(s => s.payment_status === 'paid').length.toString(),
      color: "indigo",
    },
    {
      icon: Clock,
      label: "Pagos Pendientes",
      value: `$${stats.pendingTotal.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`,
      subtitle: `${stats.pendingCount} pendientes`,
      color: "amber",
    },
    {
      icon: DollarSign,
      label: "Facturación del Día",
      value: `$${stats.dailyTotal.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`,
      subtitle: `${stats.dailySessionCount} sesiones`,
      color: "emerald",
    },
  ]

  return (
    <ProtectedRoute>
      <div className="flex h-screen overflow-hidden">
        <Sidebar currentPage="reportes" />

        <main className="flex-1 flex flex-col overflow-y-auto bg-background pt-16 lg:pt-0">
          {/* Header */}
          <header className="max-w-[1200px] w-full mx-auto px-4 md:px-6 pt-6 md:pt-8 pb-4 md:pb-6">
            <div className="flex flex-col gap-4">
              <div>
                <h2 className="text-2xl md:text-3xl font-black text-foreground tracking-tight">
                  Reportes Financieros
                </h2>
                <p className="text-muted-foreground text-xs md:text-sm mt-1">
                  Análisis detallado de ingresos y rendimiento.
                </p>
              </div>
            </div>
          </header>

          {/* Stats Cards */}
          <section className="max-w-[1200px] w-full mx-auto px-4 md:px-6 mb-6 md:mb-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {statsCards.map((stat, index) => (
                <div key={index} className="bg-card p-4 md:p-6 rounded-xl border shadow-sm">
                  <div className="flex items-center justify-between mb-3 md:mb-4">
                    <div className={`size-9 md:size-10 rounded-lg flex items-center justify-center ${stat.color === 'blue' ? 'bg-blue-50 text-blue-600' :
                        stat.color === 'indigo' ? 'bg-indigo-50 text-indigo-600' :
                          stat.color === 'amber' ? 'bg-amber-50 text-amber-600' :
                            'bg-emerald-50 text-emerald-600'
                      }`}>
                      <stat.icon className="size-4 md:size-5" />
                    </div>
                  </div>
                  <p className="text-muted-foreground text-xs md:text-sm font-medium">{stat.label}</p>
                  <h3 className="text-xl md:text-2xl font-bold text-foreground mt-1">{stat.value}</h3>
                  {stat.subtitle && (
                    <p className="text-xs text-muted-foreground mt-1">{stat.subtitle}</p>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Billing History */}
          <section className="max-w-[1200px] w-full mx-auto px-4 md:px-6 pb-8 md:pb-12">
            <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
              <div className="p-4 md:p-5 border-b flex items-center justify-between">
                <h4 className="font-bold text-foreground text-sm md:text-base">Historial de Facturación</h4>
                <span className="text-xs text-muted-foreground">Mes actual</span>
              </div>

              {recentSales.length === 0 ? (
                <div className="p-12 text-center text-muted-foreground text-sm">
                  No hay ventas registradas este mes
                </div>
              ) : (
                <>
                  {/* Mobile View */}
                  <div className="md:hidden divide-y divide-border">
                    {recentSales.slice(0, 10).map((sale, index) => (
                      <div key={sale.id} className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className={`size-8 rounded-full ${getColorClass(index)} flex items-center justify-center font-bold text-xs`}>
                              {sale.patient?.full_name ? getInitials(sale.patient.full_name) : 'PA'}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-foreground">{sale.patient?.full_name}</p>
                              <p className="text-xs text-muted-foreground">{sale.service_name}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-foreground">
                              ${sale.amount.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                            </p>
                            {sale.payment_status === 'paid' ? (
                              <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-100 text-emerald-700">
                                Pagado
                              </span>
                            ) : (
                              <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-100 text-amber-700">
                                Pendiente
                              </span>
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {new Date(sale.service_date).toLocaleDateString('es-AR')}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Desktop View */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-muted/50 border-b">
                          <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">Fecha</th>
                          <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">Paciente</th>
                          <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">Servicio</th>
                          <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-muted-foreground">Monto</th>
                          <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-muted-foreground">Estado</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {recentSales.slice(0, 15).map((sale, index) => (
                          <tr key={sale.id} className="hover:bg-muted/30 transition-colors">
                            <td className="px-6 py-4 text-sm text-muted-foreground">
                              {new Date(sale.service_date).toLocaleDateString('es-AR')}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className={`size-8 rounded-full ${getColorClass(index)} flex items-center justify-center font-bold text-xs`}>
                                  {sale.patient?.full_name ? getInitials(sale.patient.full_name) : 'PA'}
                                </div>
                                <span className="text-sm font-semibold text-foreground">
                                  {sale.patient?.full_name || 'Paciente'}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-foreground">{sale.service_name}</td>
                            <td className="px-6 py-4 text-right text-sm font-bold text-foreground">
                              ${sale.amount.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                            </td>
                            <td className="px-6 py-4 text-center">
                              {sale.payment_status === 'paid' ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 border border-emerald-200">
                                  Pagado
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700 border border-amber-200">
                                  Pendiente
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="p-4 border-t bg-muted/30 text-center">
                    <p className="text-xs text-muted-foreground">
                      Mostrando {Math.min(recentSales.length, 15)} de {recentSales.length} ventas del mes
                    </p>
                  </div>
                </>
              )}
            </div>
          </section>
        </main>
      </div>
    </ProtectedRoute>
  )
}
