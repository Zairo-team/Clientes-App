"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Edit2, Trash2, X, Eye } from "lucide-react"
import { cancelAppointment } from "@/lib/api/appointments"
import type { Appointment } from "@/lib/supabase/client"

interface AppointmentDetailModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  appointment: (Appointment & {
    patient?: { full_name: string; id?: string } | null
    service?: { name: string; color: string } | null
  }) | null
  onAppointmentUpdated?: () => void
  onEdit?: (appointment: Appointment) => void
}

export function AppointmentDetailModal({
  open,
  onOpenChange,
  appointment,
  onAppointmentUpdated,
  onEdit,
}: AppointmentDetailModalProps) {
  const router = useRouter()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  if (!appointment) return null

  const getServiceColor = () => {
    const color = appointment.service?.color
    if (color === 'blue') return 'bg-blue-100 border-blue-500 text-blue-900'
    if (color === 'emerald') return 'bg-emerald-100 border-emerald-500 text-emerald-900'
    if (color === 'purple') return 'bg-purple-100 border-purple-500 text-purple-900'
    if (color === 'amber') return 'bg-amber-100 border-amber-500 text-amber-900'
    return 'bg-primary/10 border-primary text-primary'
  }

  // Parse date correctly to avoid UTC offset issues
  const formatDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-').map(Number)
    const date = new Date(year, month - 1, day)
    return date.toLocaleDateString('es-AR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    })
  }

  // Calculate remaining balance
  const getRemainingBalance = () => {
    if (!appointment.total_amount) return 0
    const depositAmount = appointment.deposit_amount || 0
    return Math.max(0, appointment.total_amount - depositAmount)
  }

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      await cancelAppointment(appointment.id)
      
      if (onAppointmentUpdated) {
        onAppointmentUpdated()
      }
      
      onOpenChange(false)
      setShowDeleteConfirm(false)
    } catch (error) {
      console.error('Error cancelling appointment:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleEdit = () => {
    if (onEdit) {
      onEdit(appointment)
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span>Detalle de Cita</span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Service Badge */}
            <div className={`p-3 rounded-lg border-l-4 ${getServiceColor()}`}>
              <p className="text-sm font-semibold">{appointment.service?.name}</p>
            </div>

            {/* Patient Info */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Paciente
              </label>
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">{appointment.patient?.full_name}</p>
                {appointment.patient_id && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-1 h-8 px-2"
                    onClick={() => router.push(`/pacientes/${appointment.patient_id}/sesiones/${appointment.id}`)}
                  >
                    <Eye className="size-4" />
                    Ver
                  </Button>
                )}
              </div>
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Fecha
                </label>
                <p className="text-sm font-semibold">
                  {formatDate(appointment.appointment_date)}
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Hora
                </label>
                <p className="text-sm font-semibold">
                  {appointment.start_time.substring(0, 5)} - {appointment.end_time.substring(0, 5)}
                </p>
              </div>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Estado
              </label>
              <div className="flex items-center gap-2">
                <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  appointment.status === 'scheduled' ? 'bg-blue-100 text-blue-900' :
                  appointment.status === 'completed' ? 'bg-emerald-100 text-emerald-900' :
                  appointment.status === 'cancelled' ? 'bg-red-100 text-red-900' :
                  'bg-amber-100 text-amber-900'
                }`}>
                  {appointment.status === 'scheduled' ? 'Programada' :
                   appointment.status === 'completed' ? 'Completada' :
                   appointment.status === 'cancelled' ? 'Cancelada' :
                   'Sin presentarse'}
                </div>
              </div>
            </div>

            {/* Payment Status */}
            {(appointment.payment_status || appointment.total_amount) && (
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Información de Pago
                </label>
                <div className="space-y-2 bg-muted/50 p-3 rounded-lg">
                  {appointment.total_amount && (
                    <div className="flex items-center justify-between text-sm">
                      <span>Costo Total:</span>
                      <span className="font-semibold">
                        ${appointment.total_amount.toFixed(2)}
                      </span>
                    </div>
                  )}
                  {appointment.deposit_amount && (
                    <div className="flex items-center justify-between text-sm">
                      <span>Depósito/Adelanto:</span>
                      <span className="font-semibold">
                        ${appointment.deposit_amount.toFixed(2)}
                      </span>
                    </div>
                  )}
                  {getRemainingBalance() > 0 && (
                    <div className="flex items-center justify-between text-sm border-t border-border pt-2 mt-2">
                      <span>Por Abonar:</span>
                      <span className="font-semibold text-amber-600">
                        ${getRemainingBalance().toFixed(2)}
                      </span>
                    </div>
                  )}
                  {appointment.payment_status && (
                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border">
                      <span>Estado:</span>
                      <span className="font-semibold">
                        {appointment.payment_status === 'paid' ? 'Pagado' :
                         appointment.payment_status === 'partial' ? 'Parcial' :
                         'No pagado'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Notes */}
            {appointment.notes && (
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Notas
                </label>
                <p className="text-sm text-muted-foreground">{appointment.notes}</p>
              </div>
            )}

            {/* Action Buttons */}
            {appointment.status === 'scheduled' && (
              <div className="flex gap-2 pt-2">
                <Button
                  onClick={handleEdit}
                  variant="outline"
                  className="flex-1 flex items-center gap-2"
                >
                  <Edit2 className="size-4" />
                  Editar
                </Button>
                <Button
                  onClick={() => setShowDeleteConfirm(true)}
                  variant="outline"
                  className="flex-1 flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="size-4" />
                  Cancelar
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogTitle>¿Cancelar cita?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción no se puede deshacer. La cita será cancelada.
          </AlertDialogDescription>
          <div className="flex gap-2 justify-end">
            <AlertDialogCancel disabled={isDeleting}>Volver</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? 'Cancelando...' : 'Cancelar Cita'}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
