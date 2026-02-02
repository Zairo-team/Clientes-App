'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Sidebar } from '@/components/dashboard/sidebar'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Save, FileText, Loader2 } from 'lucide-react'
import Link from 'next/link'
import ProtectedRoute from '@/components/protected-route'
import { useAuth } from '@/lib/auth-context'
import { getSessionDetail, updateSessionNotes, updateSessionStatus, registerPayment, updateSessionRates } from '@/lib/api/sessions'
import { SessionPaymentPanel } from '@/components/sessions/session-payment-panel'
import { RegisterPaymentModal } from '@/components/sessions/register-payment-modal'
import { AdjustRatesModal } from '@/components/sessions/adjust-rates-modal'
import { useToast } from '@/hooks/use-toast'
import type { Patient } from '@/lib/supabase/client'

type SessionWithRelations = {
  id: string
  professional_id: string
  patient_id: string
  service_id: string
  appointment_date: string
  start_time: string
  end_time: string
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show'
  notes: string | null
  total_amount: number | null
  deposit_amount: number | null
  deposit_paid: boolean | null
  remaining_balance: number | null
  balance_paid: boolean | null
  payment_status: 'unpaid' | 'partial' | 'paid' | null
  service: {
    id: string
    name: string
    price: number
    color: string
  } | null
  patient: Patient | null
}

export default function SessionDetailPage() {
  const { profile } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const params = useParams()
  const patientId = params.id as string
  const sessionId = params.sessionId as string

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

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [session, setSession] = useState<SessionWithRelations | null>(null)
  const [notes, setNotes] = useState('')
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showRatesModal, setShowRatesModal] = useState(false)

  useEffect(() => {
    if (profile?.id && sessionId) {
      loadSession()
    }
  }, [profile?.id, sessionId])

  const loadSession = async () => {
    if (!profile?.id) return

    try {
      setLoading(true)
      const data = await getSessionDetail(sessionId, profile.id)
      setSession(data as SessionWithRelations)
      setNotes(data.notes || '')
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo cargar la sesión',
        variant: 'destructive',
      })
      router.push(`/pacientes/${patientId}`)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveNotes = async () => {
    if (!profile?.id || !session) return

    try {
      setSaving(true)
      await updateSessionNotes(sessionId, notes, profile.id)
      setHasUnsavedChanges(false)
      toast({
        title: 'Notas guardadas',
        description: 'Las notas de la sesión se guardaron correctamente',
      })
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'No se pudieron guardar las notas',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleNotesChange = (value: string) => {
    setNotes(value)
    setHasUnsavedChanges(true)
  }

  const handleStatusChange = async (newStatus: 'scheduled' | 'completed' | 'cancelled' | 'no_show') => {
    if (!profile?.id || !session) return

    try {
      await updateSessionStatus(sessionId, newStatus, profile.id)
      setSession({ ...session, status: newStatus })
      toast({
        title: 'Estado actualizado',
        description: 'El estado de la sesión se actualizó correctamente',
      })
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo actualizar el estado',
        variant: 'destructive',
      })
    }
  }

  const handleRegisterPayment = async (amount: number, type: 'deposit' | 'balance') => {
    if (!profile?.id) return

    try {
      const updatedSession = await registerPayment(sessionId, amount, type, profile.id)
      setSession(prev => prev ? { ...prev, ...updatedSession } : null)
      toast({
        title: 'Pago registrado',
        description: `Se registró el pago de ${type === 'deposit' ? 'seña' : 'saldo'} exitosamente`,
      })
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo registrar el pago',
        variant: 'destructive',
      })
      throw error
    }
  }

  const handleAdjustRates = async (totalAmount: number, depositAmount: number) => {
    if (!profile?.id) return

    try {
      const updatedSession = await updateSessionRates(sessionId, totalAmount, depositAmount, profile.id)
      setSession(prev => prev ? { ...prev, ...updatedSession } : null)
      toast({
        title: 'Tarifas actualizadas',
        description: 'Las tarifas se actualizaron correctamente',
      })
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'No se pudieron actualizar las tarifas',
        variant: 'destructive',
      })
      throw error
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

  if (!session || !session.patient) {
    return (
      <ProtectedRoute>
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-muted-foreground">Sesión no encontrada</p>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="flex h-screen overflow-hidden bg-background">
        <Sidebar />

        <main className="flex-1 overflow-auto">
          {/* Header */}
          <header className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
            <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Link href={`/pacientes/${patientId}`}>
                    <Button variant="ghost" size="icon" className="shrink-0">
                      <ArrowLeft className="w-5 h-5" />
                    </Button>
                  </Link>
                  <div>
                    <h1 className="text-xl md:text-2xl font-bold text-foreground">
                      {session.patient.full_name}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                      {formatAppointmentDate(session.appointment_date)} • {session.start_time.substring(0, 5)} - {session.end_time.substring(0, 5)}
                      {session.service && ` • ${session.service.name}`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    className="hidden md:flex items-center gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    Emitir Recibo
                  </Button>
                  <Button
                    onClick={handleSaveNotes}
                    disabled={saving || !hasUnsavedChanges}
                    className="flex items-center gap-2"
                  >
                    {saving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    <span className="hidden sm:inline">
                      {saving ? 'Guardando...' : 'Guardar Cambios'}
                    </span>
                  </Button>
                </div>
              </div>
            </div>
          </header>

          {/* Content */}
          <div className="max-w-[1400px] mx-auto p-4 md:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column - Notes */}
              <div className="lg:col-span-7">
                <div className="bg-card rounded-xl border p-4 md:p-6 shadow-sm">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    Notas de la Sesión / Evolución
                  </h3>

                  <textarea
                    value={notes}
                    onChange={(e) => handleNotesChange(e.target.value)}
                    placeholder="Comienza a escribir la evolución clínica de esta sesión..."
                    className="w-full min-h-[400px] p-4 rounded-lg border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                  />

                  <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                    <span>Auto-guardado: Hace 2 minutos</span>
                    <span>{notes.length} caracteres</span>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="lg:col-span-5 space-y-6">
                <SessionPaymentPanel
                  session={session}
                  onStatusChange={handleStatusChange}
                  onRegisterPayment={() => setShowPaymentModal(true)}
                  onAdjustRates={() => setShowRatesModal(true)}
                />

                {/* Patient Info */}
                <div className="bg-card rounded-xl border p-4 md:p-6 shadow-sm">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">
                    Información del Paciente
                  </h4>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center text-lg font-bold text-primary">
                      {session.patient.full_name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{session.patient.full_name}</p>
                      <p className="text-sm text-muted-foreground">{session.patient.dni}</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    {session.patient.phone && (
                      <p className="text-muted-foreground">📞 {session.patient.phone}</p>
                    )}
                    {session.patient.email && (
                      <p className="text-muted-foreground truncate">✉️ {session.patient.email}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        {session && (
          <>
            <RegisterPaymentModal
              isOpen={showPaymentModal}
              onClose={() => setShowPaymentModal(false)}
              onConfirm={handleRegisterPayment}
              remainingBalance={session.remaining_balance || 0}
              depositAmount={session.deposit_amount || 0}
              depositPaid={session.deposit_paid || false}
            />

            <AdjustRatesModal
              isOpen={showRatesModal}
              onClose={() => setShowRatesModal(false)}
              onConfirm={handleAdjustRates}
              currentTotal={session.total_amount || 0}
              currentDeposit={session.deposit_amount || 0}
            />
          </>
        )}
      </div>
    </ProtectedRoute>
  )
}
