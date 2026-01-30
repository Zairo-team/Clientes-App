'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from '@/components/dashboard/sidebar'
import { Button } from '@/components/ui/button'
import { Clock, Plus, MoreVertical, Loader2 } from 'lucide-react'
import { NewServiceModal } from '@/components/services/new-service-modal'
import ProtectedRoute from '@/components/protected-route'
import { useAuth } from '@/lib/auth-context'
import { getServices } from '@/lib/api/services'
import type { Service } from '@/lib/supabase/client'

const colorClasses = {
  blue: 'border-t-blue-500 text-blue-500',
  purple: 'border-t-purple-500 text-purple-500',
  emerald: 'border-t-emerald-500 text-emerald-500',
  orange: 'border-t-orange-500 text-orange-500',
  cyan: 'border-t-cyan-500 text-cyan-500',
  rose: 'border-t-rose-500 text-rose-500',
  amber: 'border-t-amber-500 text-amber-500',
}

export default function ServiciosPage() {
  const { profile } = useAuth()
  const [isNewServiceModalOpen, setIsNewServiceModalOpen] = useState(false)
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (profile?.id) {
      loadServices()
    }
  }, [profile?.id]) // Only re-run when profile ID actually changes

  const loadServices = async () => {
    if (!profile?.id) return

    try {
      setLoading(true)
      const data = await getServices(profile.id)
      setServices(data)
    } catch (error) {
      console.error('Error loading services:', error)
    } finally {
      setLoading(false)
    }
  }

  const getColorClasses = (color: string) => {
    return colorClasses[color as keyof typeof colorClasses] || colorClasses.blue
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
        <Sidebar currentPage="servicios" />

        <main className="flex-1 flex flex-col overflow-y-auto bg-background pt-16 lg:pt-0">
          <header className="max-w-[1200px] w-full mx-auto px-4 md:px-6 pt-6 md:pt-8 pb-4 md:pb-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-2xl md:text-3xl font-black text-foreground tracking-tight">Gestión de Servicios</h2>
                <p className="text-muted-foreground text-xs md:text-sm mt-1">
                  Administra tu catálogo de servicios profesionales.
                </p>
              </div>
              <Button
                onClick={() => setIsNewServiceModalOpen(true)}
                className="flex items-center gap-2 h-10 md:h-11 font-bold shadow-lg text-sm"
              >
                <Plus className="w-4 h-4 md:w-5 md:h-5" />
                <span className="hidden sm:inline">Nuevo Servicio</span>
                <span className="sm:hidden">Nuevo</span>
              </Button>
            </div>
          </header>

          <section className="max-w-[1200px] w-full mx-auto px-4 md:px-6 pb-8 md:pb-12">
            {services.length === 0 ? (
              <div className="bg-card rounded-xl border shadow-sm p-12 text-center">
                <p className="text-muted-foreground text-sm mb-4">
                  Aún no tienes servicios registrados
                </p>
                <Button onClick={() => setIsNewServiceModalOpen(true)} variant="outline">
                  Crear primer servicio
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 md:gap-6">
                {services.map((service) => {
                  const colorClass = getColorClasses(service.color)
                  return (
                    <div
                      key={service.id}
                      className={`bg-card rounded-xl border shadow-sm overflow-hidden border-t-4 ${colorClass.split(' ')[0]} transition-all hover:shadow-md`}
                    >
                      <div className="p-5 md:p-6">
                        <div className="flex items-start justify-between mb-3 md:mb-4">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base md:text-lg font-bold text-foreground truncate">{service.name}</h3>
                            <p className={`text-xs md:text-sm font-semibold ${colorClass.split(' ')[1]}`}>
                              {service.category}
                            </p>
                          </div>
                          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary shrink-0">
                            <MoreVertical className="w-4 h-4 md:w-5 md:h-5" />
                          </Button>
                        </div>

                        <p className="text-xs md:text-sm text-muted-foreground mb-4 md:mb-6 line-clamp-2">
                          {service.description || 'Sin descripción'}
                        </p>

                        <div className="flex items-center justify-between pt-3 md:pt-4 border-t">
                          <div className="flex items-center gap-1.5 md:gap-2 text-muted-foreground">
                            <Clock className="w-3.5 h-3.5 md:w-4 md:h-4" />
                            <span className="text-xs md:text-sm font-medium">{service.duration_minutes} min</span>
                          </div>
                          <div className={`text-xl md:text-2xl font-black ${colorClass.split(' ')[1]}`}>
                            ${service.price.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </section>
        </main>

        <NewServiceModal
          open={isNewServiceModalOpen}
          onOpenChange={setIsNewServiceModalOpen}
          onServiceCreated={loadServices}
        />
      </div>
    </ProtectedRoute>
  )
}
