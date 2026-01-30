'use client'

import { useEffect, useState } from 'react'
import { Sidebar } from '@/components/dashboard/sidebar'
import { Button } from '@/components/ui/button'
import { Plus, Search, Eye, Mail, MessageCircle, Loader2, Filter, Download, MoreVertical, Edit, Trash2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { CreatePatientModal } from '@/components/patients/create-patient-modal'
import { EditPatientModal } from '@/components/patients/edit-patient-modal'
import ProtectedRoute from '@/components/protected-route'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { getPatients, searchPatients } from '@/lib/api/patients'
import type { Patient } from '@/lib/supabase/client'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export default function PacientesPage() {
  const { profile } = useAuth()
  const router = useRouter()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (profile?.id) {
      loadPatients()
    }
  }, [profile?.id]) // Only re-run when profile ID actually changes

  const loadPatients = async () => {
    if (!profile?.id) return

    try {
      setLoading(true)
      const data = await getPatients(profile.id)
      setPatients(data)
    } catch (error) {
      console.error('Error loading patients:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async (query: string) => {
    setSearchQuery(query)
    if (!profile?.id) return

    if (!query.trim()) {
      loadPatients()
      return
    }

    try {
      const data = await searchPatients(profile.id, query)
      setPatients(data)
    } catch (error) {
      console.error('Error searching patients:', error)
    }
  }

  const getInitials = (name: string) => {
    const names = name.split(' ')
    return names.length > 1
      ? `${names[0][0]}${names[1][0]}`.toUpperCase()
      : name.substring(0, 2).toUpperCase()
  }

  const getColorClass = (index: number) => {
    const colors = [
      'bg-blue-100 text-blue-700',
      'bg-purple-100 text-purple-700',
      'bg-orange-100 text-orange-700',
      'bg-cyan-100 text-cyan-700',
      'bg-rose-100 text-rose-700',
      'bg-emerald-100 text-emerald-700',
    ]
    return colors[index % colors.length]
  }

  const getTimeAgo = (date: string) => {
    if (!date) return 'Nunca'
    const days = Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24))
    if (days === 0) return 'Hoy'
    if (days === 1) return 'Ayer'
    if (days < 7) return `Hace ${days} días`
    if (days < 30) return `Hace ${Math.floor(days / 7)} semanas`
    return `Hace ${Math.floor(days / 30)} meses`
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
      <div className="flex h-screen overflow-hidden bg-background">
        <Sidebar currentPage="pacientes" />

        <main className="flex-1 flex flex-col overflow-y-auto pt-16 lg:pt-0">
          <div className="max-w-[1200px] w-full mx-auto px-4 md:px-6 pt-6 md:pt-8 pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl md:text-3xl font-black text-foreground tracking-tight">{"Pacientes"}</h2>
                <p className="text-muted-foreground text-xs md:text-sm mt-1">
                  {"Gestiona tu base de datos de pacientes y su historial."}
                </p>
              </div>
              <Button
                onClick={() => setIsCreateModalOpen(true)}
                className="flex items-center gap-2 h-10 md:h-11 font-bold shadow-lg text-sm"
              >
                <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m3-3H9" />
                </svg>
                <span className="hidden sm:inline">{"Nuevo Paciente"}</span>
                <span className="sm:hidden">{"Nuevo"}</span>
              </Button>
            </div>
          </div>

          <div className="max-w-[1200px] w-full mx-auto px-4 md:px-6 py-3 md:py-4">
            <div className="bg-card p-2 rounded-xl border shadow-sm flex flex-col md:flex-row gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-muted-foreground" />
                <Input
                  className="pl-9 md:pl-11 h-10 md:h-11 bg-muted border-none text-sm"
                  placeholder="Buscar por nombre, DNI o email..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 md:flex-initial flex items-center justify-center gap-2 bg-transparent h-10 md:h-11 text-sm">
                  <Filter className="w-4 h-4" />
                  <span className="hidden sm:inline">{"Filtros"}</span>
                </Button>
                <Button variant="outline" className="flex-1 md:flex-initial flex items-center justify-center gap-2 bg-transparent h-10 md:h-11 text-sm">
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">{"Exportar"}</span>
                </Button>
              </div>
            </div>
          </div>

          <div className="max-w-[1200px] w-full mx-auto px-4 md:px-6 pb-8 md:pb-12">
            <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
              {patients.length === 0 ? (
                <div className="p-12 text-center">
                  <p className="text-muted-foreground text-sm mb-4">
                    {searchQuery ? 'No se encontraron pacientes' : 'Aún no tienes pacientes registrados'}
                  </p>
                  {!searchQuery && (
                    <Button onClick={() => setIsCreateModalOpen(true)} variant="outline">
                      Crear primer paciente
                    </Button>
                  )}
                </div>
              ) : (
                <>
                  {/* Mobile Card View */}
                  <div className="md:hidden divide-y divide-border">
                    {patients.map((patient, index) => (
                      <div key={patient.id} className="p-4 hover:bg-muted/30 transition-colors">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className={`size-10 rounded-full ${getColorClass(index)} flex items-center justify-center font-bold text-xs shrink-0`}>
                              {getInitials(patient.full_name)}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-foreground truncate">{patient.full_name}</p>
                              <p className="text-xs text-muted-foreground truncate">DNI: {patient.dni}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {patient.phone && (
                              <a
                                href={`https://wa.me/${patient.phone.replace(/\D/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="size-8 rounded-lg bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:hover:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center transition-colors"
                              >
                                <MessageCircle className="w-4 h-4" />
                              </a>
                            )}
                            {patient.email && (
                              <a
                                href={`mailto:${patient.email}`}
                                className="size-8 rounded-lg bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center transition-colors"
                              >
                                <Mail className="w-4 h-4" />
                              </a>
                            )}
                            <button
                              onClick={() => router.push(`/pacientes/${patient.id}`)}
                              className="size-8 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary flex items-center justify-center transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground pl-[52px]">
                          <span>{patient.email || 'Sin email'}</span>
                          <span>•</span>
                          <span>{patient.phone || 'Sin teléfono'}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Desktop Table View */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-muted/50 border-b">
                          <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            {"Nombre"}
                          </th>
                          <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            {"DNI"}
                          </th>
                          <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            {"Última Sesión"}
                          </th>
                          <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            {"Contacto"}
                          </th>
                          <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground text-center">
                            {"Acciones"}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {patients.map((patient, index) => (
                          <tr key={patient.id} className="hover:bg-muted/30 transition-colors group">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className={`size-9 rounded-full ${getColorClass(index)} flex items-center justify-center font-bold text-xs`}>
                                  {getInitials(patient.full_name)}
                                </div>
                                <span className="text-sm font-semibold text-foreground">{patient.full_name}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm text-foreground font-medium">{patient.dni}</span>
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-sm text-muted-foreground">
                                {patient.last_session_date
                                  ? new Date(patient.last_session_date).toLocaleDateString('es-AR')
                                  : 'Sin sesiones'}
                              </p>
                              <p className="text-[10px] text-muted-foreground/60">{getTimeAgo(patient.last_session_date || '')}</p>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-col">
                                <span className="text-sm text-muted-foreground">{patient.email || 'Sin email'}</span>
                                <span className="text-xs text-muted-foreground/60">{patient.phone || 'Sin teléfono'}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center justify-center gap-2">
                                {patient.phone && (
                                  <a
                                    href={`https://wa.me/${patient.phone.replace(/\D/g, '')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="size-9 rounded-lg bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:hover:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center transition-colors"
                                    title="Enviar WhatsApp"
                                  >
                                    <MessageCircle className="w-4 h-4" />
                                  </a>
                                )}
                                {patient.email && (
                                  <a
                                    href={`mailto:${patient.email}`}
                                    className="size-9 rounded-lg bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center transition-colors"
                                    title="Enviar email"
                                  >
                                    <Mail className="w-4 h-4" />
                                  </a>
                                )}
                                <button
                                  onClick={() => router.push(`/pacientes/${patient.id}`)}
                                  className="size-9 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary flex items-center justify-center transition-colors"
                                  title="Ver detalle"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 md:px-6 py-3 md:py-4 bg-muted/50 border-t">
                    <p className="text-xs md:text-sm text-muted-foreground">
                      {"Mostrando "}
                      <span className="font-medium text-foreground">{patients.length}</span>
                      {" pacientes"}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </main>

        <CreatePatientModal
          open={isCreateModalOpen}
          onOpenChange={setIsCreateModalOpen}
          onPatientCreated={loadPatients}
        />

        <EditPatientModal
          open={isEditModalOpen}
          onOpenChange={setIsEditModalOpen}
          patient={selectedPatient}
          onPatientUpdated={loadPatients}
        />
      </div>
    </ProtectedRoute>
  )
}
