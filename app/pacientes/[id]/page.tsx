'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from '@/components/dashboard/sidebar'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Calendar as CalendarIcon, Plus, Phone, Mail, Award as IdCard, Loader2, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { ScheduleAppointmentModal } from '@/components/patients/schedule-appointment-modal'
import { NewSessionModal } from '@/components/patients/new-session-modal'
import { EditPatientModal } from '@/components/patients/edit-patient-modal'
import ProtectedRoute from '@/components/protected-route'
import { useAuth } from '@/lib/auth-context'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { deletePatient } from '@/lib/api/patients'
import { useToast } from '@/hooks/use-toast'
import type { Patient, Appointment, Sale } from '@/lib/supabase/client'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

type AppointmentWithService = Appointment & {
  service: { name: string; color: string } | null
}

type SaleWithService = Sale & {
  service: { name: string } | null
}

export default function PatientDetailPage() {
  const { profile } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const params = useParams()
  const patientId = params.id as string

  const [activeTab, setActiveTab] = useState('timeline')
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [showNewSessionModal, setShowNewSessionModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [patient, setPatient] = useState<Patient | null>(null)
  const [appointments, setAppointments] = useState<AppointmentWithService[]>([])
  const [sales, setSales] = useState<SaleWithService[]>([])

  useEffect(() => {
    if (profile?.id && patientId) {
      loadPatientData()
    }
  }, [profile?.id, patientId]) // Only re-run when profile ID or patient ID changes

  const loadPatientData = async () => {
    if (!profile?.id || !patientId) return

    try {
      setLoading(true)
      const supabase = createClient()

      // Load patient data
      const { data: patientData, error: patientError } = await supabase
        .from('patients')
        .select('*')
        .eq('id', patientId)
        .eq('professional_id', profile.id)
        .single()

      if (patientError) {
        console.error('Patient error:', patientError)
        throw new Error(`Error al cargar paciente: ${patientError.message}`)
      }

      if (!patientData) {
        throw new Error('Paciente no encontrado')
      }

      setPatient(patientData)

      // Load appointments
      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from('appointments')
        .select(`
          *,
          service:services(name, color)
        `)
        .eq('patient_id', patientId)
        .eq('professional_id', profile.id)
        .order('appointment_date', { ascending: false })
        .order('start_time', { ascending: false })
        .limit(10)

      if (appointmentsError) {
        console.error('Appointments error:', appointmentsError)
        // Don't throw, just log - appointments are optional
      } else {
        setAppointments(appointmentsData as AppointmentWithService[])
      }

      // Load sales/billing
      const { data: salesData, error: salesError } = await supabase
        .from('sales')
        .select(`
          *,
          service:services(name)
        `)
        .eq('patient_id', patientId)
        .eq('professional_id', profile.id)
        .order('service_date', { ascending: false })
        .limit(10)

      if (salesError) {
        console.error('Sales error:', salesError)
        // Don't throw, just log - sales are optional
      } else {
        setSales(salesData as SaleWithService[])
      }
    } catch (error: any) {
      console.error('Error loading patient data:', error)
      toast({
        title: 'Error al cargar datos',
        description: error?.message || 'No se pudieron cargar los datos del paciente',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeletePatient = async () => {
    if (!patient?.id) return

    setIsDeleting(true)
    try {
      await deletePatient(patient.id)

      toast({
        title: 'Paciente eliminado',
        description: `${patient.full_name} ha sido eliminado exitosamente.`,
      })

      router.push('/pacientes')
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo eliminar el paciente',
        variant: 'destructive',
      })
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  const getInitials = (name: string) => {
    const names = name.split(' ')
    return names.length > 1
      ? `${names[0][0]}${names[1][0]}`.toUpperCase()
      : name.substring(0, 2).toUpperCase()
  }

  const getAge = (dateOfBirth: string | null) => {
    if (!dateOfBirth) return null
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  const getStatusBadge = (status: string) => {
    const badges = {
      completed: { label: 'Completada', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
      scheduled: { label: 'Programada', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
      cancelled: { label: 'Cancelada', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
      no_show: { label: 'No asistió', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
    }
    return badges[status as keyof typeof badges] || badges.scheduled
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

  if (!patient) {
    return (
      <ProtectedRoute>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">Paciente no encontrado</p>
            <Link href="/pacientes">
              <Button>Volver a Pacientes</Button>
            </Link>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  const age = getAge(patient.date_of_birth)

  return (
    <ProtectedRoute>
      <div className="flex h-screen overflow-hidden bg-background">
        <Sidebar currentPage="pacientes" />

        <main className="flex-1 flex flex-col overflow-y-auto pt-16 lg:pt-0">
          <header className="sticky top-16 lg:top-0 z-10 bg-background/80 backdrop-blur-md px-4 md:px-8 py-4 md:py-6 border-b">
            <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3 md:gap-4">
                <Link href="/pacientes">
                  <Button
                    size="icon"
                    variant="outline"
                    className="rounded-full size-9 md:size-10 bg-transparent"
                  >
                    <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
                  </Button>
                </Link>
                <div>
                  <h2 className="text-xl md:text-2xl font-black text-foreground tracking-tight">
                    Ficha del Paciente
                  </h2>
                  <p className="text-muted-foreground text-xs md:text-sm">Historial médico digitalizado</p>
                </div>
              </div>
              <div className="flex items-center gap-2 md:gap-3">
                <Button
                  variant="outline"
                  className="flex-1 md:flex-initial flex items-center justify-center gap-2 h-9 md:h-11 font-bold bg-transparent text-sm"
                  onClick={() => setShowScheduleModal(true)}
                >
                  <CalendarIcon className="w-4 h-4 md:w-5 md:h-5" />
                  <span className="hidden sm:inline">Agendar Cita</span>
                  <span className="sm:hidden">Agendar</span>
                </Button>
                <Button
                  className="flex-1 md:flex-initial flex items-center justify-center gap-2 h-9 md:h-11 font-bold shadow-lg text-sm"
                  onClick={() => setShowNewSessionModal(true)}
                >
                  <Plus className="w-4 h-4 md:w-5 md:h-5" />
                  <span className="hidden sm:inline">Nueva Sesión</span>
                  <span className="sm:hidden">Sesión</span>
                </Button>
              </div>
            </div>
          </header>

          <div className="max-w-[1400px] mx-auto w-full p-4 md:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-8">
              <aside className="lg:col-span-4 space-y-4 md:space-y-6">
                <div className="bg-card rounded-2xl border overflow-hidden shadow-sm">
                  <div className="p-6 md:p-8 flex flex-col items-center border-b">
                    <div className="size-24 md:size-32 rounded-2xl md:rounded-3xl bg-primary/10 border-4 border-background shadow-xl mb-3 md:mb-4 flex items-center justify-center text-3xl md:text-4xl font-bold text-primary">
                      {getInitials(patient.full_name)}
                    </div>
                    <h3 className="text-lg md:text-xl font-bold text-foreground">{patient.full_name}</h3>
                    <p className="text-muted-foreground font-medium text-sm">
                      {age ? `${age} años` : 'Edad no especificada'}
                    </p>
                  </div>

                  <div className="p-4 md:p-6 space-y-4 md:space-y-6">
                    <div>
                      <h4 className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 md:mb-4">
                        Información de Contacto
                      </h4>
                      <div className="space-y-3 md:space-y-4">
                        {patient.dni && (
                          <div className="flex items-start gap-3">
                            <IdCard className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground mt-0.5" />
                            <div className="text-sm">
                              <p className="text-muted-foreground text-[10px] md:text-xs">DNI</p>
                              <p className="text-foreground font-medium text-xs md:text-sm">{patient.dni}</p>
                            </div>
                          </div>
                        )}
                        {patient.phone && (
                          <div className="flex items-start gap-3">
                            <Phone className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground mt-0.5" />
                            <div className="text-sm">
                              <p className="text-muted-foreground text-[10px] md:text-xs">Teléfono</p>
                              <p className="text-foreground font-medium text-xs md:text-sm">{patient.phone}</p>
                            </div>
                          </div>
                        )}
                        {patient.email && (
                          <div className="flex items-start gap-3">
                            <Mail className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground mt-0.5" />
                            <div className="text-sm min-w-0">
                              <p className="text-muted-foreground text-[10px] md:text-xs">Email</p>
                              <p className="text-foreground font-medium text-xs md:text-sm truncate">{patient.email}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-4 md:pt-6 border-t space-y-3">
                      <Button
                        variant="outline"
                        className="w-full flex items-center gap-2 font-semibold bg-transparent h-10 text-sm"
                        onClick={() => setShowEditModal(true)}
                      >
                        <IdCard className="w-4 h-4" />
                        Editar Información
                      </Button>
                      <Button
                        variant="destructive"
                        className="w-full flex items-center gap-2 font-semibold h-10 text-sm"
                        onClick={() => setShowDeleteDialog(true)}
                      >
                        <Trash2 className="w-4 h-4" />
                        Eliminar Paciente
                      </Button>
                    </div>

                    {patient.notes && (
                      <div className="pt-4 md:pt-6 border-t">
                        <h4 className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 md:mb-4">
                          Notas
                        </h4>
                        <div className="bg-muted/50 p-3 md:p-4 rounded-xl text-xs md:text-sm text-foreground border">
                          {patient.notes}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </aside>

              <div className="lg:col-span-8 flex flex-col gap-4 md:gap-6">
                <div className="bg-card p-1 md:p-1.5 rounded-xl border flex shadow-sm overflow-x-auto">
                  <button
                    onClick={() => setActiveTab('timeline')}
                    className={`flex-1 min-w-[80px] flex items-center justify-center gap-1 md:gap-2 py-2 md:py-2.5 rounded-lg text-xs md:text-sm font-bold transition-all ${activeTab === 'timeline'
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-muted-foreground hover:text-primary'
                      }`}
                  >
                    <CalendarIcon className="w-4 h-4 md:w-5 md:h-5" />
                    <span className="hidden sm:inline">Historial</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('facturacion')}
                    className={`flex-1 min-w-[60px] flex items-center justify-center gap-1 md:gap-2 py-2 md:py-2.5 rounded-lg text-xs md:text-sm font-semibold transition-all ${activeTab === 'facturacion'
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-muted-foreground hover:text-primary'
                      }`}
                  >
                    <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span className="hidden sm:inline">Pagos</span>
                  </button>
                </div>

                {activeTab === 'timeline' && (
                  <div className="space-y-4">
                    {appointments.length === 0 ? (
                      <div className="bg-card rounded-xl border p-12 text-center">
                        <p className="text-muted-foreground text-sm">No hay citas registradas</p>
                      </div>
                    ) : (
                      appointments.map((appointment) => {
                        const statusBadge = getStatusBadge(appointment.status)
                        return (
                          <div key={appointment.id} className="bg-card rounded-xl border p-4 md:p-6 shadow-sm">
                            <div className="flex flex-col gap-3">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h4 className="text-sm md:text-base font-bold text-foreground">
                                    {appointment.service?.name || 'Servicio'}
                                  </h4>
                                  <p className="text-muted-foreground text-xs md:text-sm mt-1">
                                    {new Date(appointment.appointment_date).toLocaleDateString('es-AR', {
                                      day: 'numeric',
                                      month: 'long',
                                      year: 'numeric'
                                    })} • {appointment.start_time.substring(0, 5)} - {appointment.end_time.substring(0, 5)}
                                  </p>
                                </div>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${statusBadge.color}`}>
                                  {statusBadge.label}
                                </span>
                              </div>
                              {appointment.notes && (
                                <div className="bg-muted/50 p-3 rounded-lg text-xs text-foreground border">
                                  {appointment.notes}
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>
                )}

                {activeTab === 'facturacion' && (
                  <div className="space-y-4">
                    {sales.length === 0 ? (
                      <div className="bg-card rounded-xl border p-12 text-center">
                        <p className="text-muted-foreground text-sm">No hay ventas registradas</p>
                      </div>
                    ) : (
                      <div className="bg-card rounded-xl border overflow-hidden">
                        <div className="divide-y">
                          {sales.map((sale) => (
                            <div key={sale.id} className="p-4 hover:bg-muted/30 transition-colors">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm font-semibold text-foreground">{sale.service_name}</p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {new Date(sale.service_date).toLocaleDateString('es-AR')}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-bold text-foreground">
                                    ${sale.amount.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                                  </p>
                                  <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium mt-1 ${sale.payment_status === 'paid'
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : 'bg-amber-100 text-amber-700'
                                    }`}>
                                    {sale.payment_status === 'paid' ? 'Pagado' : 'Pendiente'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>

        <ScheduleAppointmentModal
          isOpen={showScheduleModal}
          onClose={() => setShowScheduleModal(false)}
          patientId={patient.id}
          patientName={patient.full_name}
          onAppointmentCreated={loadPatientData}
        />

        <NewSessionModal
          isOpen={showNewSessionModal}
          onClose={() => setShowNewSessionModal(false)}
          patientId={patient.id}
          patientName={patient.full_name}
          onSessionCreated={loadPatientData}
        />

        <EditPatientModal
          open={showEditModal}
          onOpenChange={setShowEditModal}
          patient={patient}
          onPatientUpdated={loadPatientData}
        />

        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. Esto eliminará permanentemente a{' '}
                <span className="font-semibold text-foreground">{patient.full_name}</span>
                {' '}y todos sus datos asociados (citas, sesiones, pagos, etc.).
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeletePatient}
                disabled={isDeleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Eliminando...
                  </>
                ) : (
                  'Eliminar Paciente'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </ProtectedRoute>
  )
}
