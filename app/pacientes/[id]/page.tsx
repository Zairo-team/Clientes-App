'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from '@/components/dashboard/sidebar'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Calendar as CalendarIcon, Plus, Phone, Mail, Award as IdCard, Loader2, Trash2, Check, Clock, X, AlertCircle, Eye } from 'lucide-react'
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
import type { Patient, Appointment } from '@/lib/supabase/client'
import { Badge } from '@/components/ui/badge'
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



export default function PatientDetailPage() {
  const { profile } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const params = useParams()
  const patientId = params.id as string

  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [showNewSessionModal, setShowNewSessionModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [patient, setPatient] = useState<Patient | null>(null)
  const [appointments, setAppointments] = useState<AppointmentWithService[]>([])

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
        description: `${patient.full_name} ha sido eliminado del sistema.`,
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

  const formatAppointmentDate = (dateStr: string) => {
    // Parse date string (YYYY-MM-DD) without timezone to avoid UTC offset issues
    const [year, month, day] = dateStr.split('-').map(Number)
    const date = new Date(year, month - 1, day)
    return date.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })
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

  const age = getAge(patient.date_of_birth ?? null)

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
                <div className="bg-card rounded-xl border p-4 md:p-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-6">
                    <CalendarIcon className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-bold text-foreground">Historial / Timeline de Sesiones</h3>
                  </div>

                  {appointments.length === 0 ? (
                    <div className="text-center py-12">
                      <CalendarIcon className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                      <p className="text-muted-foreground text-sm">No hay sesiones registradas</p>
                    </div>
                  ) : (
                    <div className="relative">
                      {appointments.map((appointment, index) => {
                        const statusBadge = getStatusBadge(appointment.status)
                        const isCompleted = appointment.status === 'completed'
                        const isScheduled = appointment.status === 'scheduled'
                        const isCancelled = appointment.status === 'cancelled'
                        const isNoShow = appointment.status === 'no_show'

                        const dotColor = isCompleted ? 'bg-emerald-500' : isScheduled ? 'bg-orange-500' : isCancelled ? 'bg-red-500' : 'bg-gray-500'
                        const badgeColor = isCompleted ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : isScheduled ? 'bg-orange-100 text-orange-700 border-orange-200' : isCancelled ? 'bg-red-100 text-red-700 border-red-200' : 'bg-gray-100 text-gray-700 border-gray-200'

                        return (
                          <div key={appointment.id} className="relative pb-8">
                            {/* Timeline Line */}
                            {index !== appointments.length - 1 && (
                              <div className="absolute left-4 top-10 bottom-0 w-0.5 bg-border z-0" />
                            )}

                            {/* Timeline Dot */}
                            <div className="absolute left-0 top-2 z-10">
                              <div className={`size-9 rounded-full flex items-center justify-center ${dotColor} shadow-md`}>
                                <div className="size-3.5 rounded-full bg-white" />
                              </div>
                            </div>

                            {/* Session Card */}
                            <div className="ml-16 bg-card border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <h4 className="text-sm font-bold text-foreground">
                                    Sesión de {appointment.service?.name || 'Psicoterapia'}
                                  </h4>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {formatAppointmentDate(appointment.appointment_date)} • {appointment.start_time.substring(0, 5)} - {appointment.end_time.substring(0, 5)}
                                  </p>
                                </div>
                                <Badge className={`${badgeColor} text-[10px] font-bold uppercase px-2 py-1`}>
                                  {statusBadge.label}
                                </Badge>
                              </div>

                              {appointment.notes && (
                                <div className="mt-3 pt-3 border-t">
                                  <p className="text-xs text-foreground leading-relaxed line-clamp-2">
                                    {appointment.notes}
                                  </p>
                                </div>
                              )}

                              <Button
                                variant="link"
                                className="mt-2 p-0 h-auto text-xs text-primary hover:text-primary/80"
                                onClick={() => router.push(`/pacientes/${patient.id}/sesiones/${appointment.id}`)}
                              >
                                <Eye className="w-3 h-3 mr-1" />
                                Ver Detalles
                              </Button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}


                </div>
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
