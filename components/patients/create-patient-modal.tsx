'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/lib/auth-context'
import { createPatientAction } from '@/lib/actions/patient-actions'
import { getWhatsAppLink } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import { Loader2, User, X, MessageCircle } from 'lucide-react'

interface CreatePatientModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onPatientCreated: () => void
}

export function CreatePatientModal({ open, onOpenChange, onPatientCreated }: CreatePatientModalProps) {
  const { profile } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    full_name: '',
    dni: '',
    date_of_birth: '',
    email: '',
    phone: '',
    notes: '',
  })

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!profile?.id) return

    setLoading(true)
    try {
      // Server Action handles DB, Logging, and Email transactionally
      const { patient } = await createPatientAction({
        full_name: formData.full_name,
        dni: formData.dni,
        email: formData.email || null,
        phone: formData.phone || null,
        date_of_birth: formData.date_of_birth || null,
        notes: formData.notes || null,
      })

      // Reset form
      setFormData({
        full_name: '',
        dni: '',
        date_of_birth: '',
        email: '',
        phone: '',
        notes: '',
      })

      // Close modal first
      onOpenChange(false)

      // WhatsApp link
      const businessName = profile.business_name || 'Gestor Pro'
      const waLink = getWhatsAppLink(
        patient.phone,
        `Hola ${patient.full_name}! 👋\n\nBienvenido a *${businessName}*.\n✅ Ya hemos creado tu ficha de paciente en nuestro sistema.\n\nCualquier consulta estamos a tu disposición.\nSaludos!`
      )

      // Show toast
      toast({
        title: '¡Paciente creado con éxito!',
        description: `${patient.full_name} ha sido agregado al sistema.`,
        action: (
          <div className="flex gap-2">
            {waLink && (
              <button
                onClick={() => window.open(waLink, '_blank')}
                className="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium bg-green-600 text-white px-3 py-2 hover:bg-green-700 transition-colors whitespace-nowrap"
              >
                <MessageCircle className="size-4" />
                Notificar
              </button>
            )}
            <button
              onClick={() => router.push(`/pacientes/${patient.id}`)}
              className="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium bg-primary/20 text-primary px-3 py-2 hover:bg-primary/30 transition-colors whitespace-nowrap"
            >
              Ver Detalle
            </button>
          </div>
        )
      })

      // Delay the callback to allow toast to render
      setTimeout(() => {
        onPatientCreated()
      }, 100)
    } catch (error: any) {
      let errorMessage = error.message || 'No se pudo crear el paciente'

      // Check for duplicate DNI error
      if (error.message?.includes('duplicate') || error.message?.includes('unique') || error.code === '23505') {
        errorMessage = 'Ya existe un paciente con este DNI en el sistema'
      }

      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <User className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold">Nuevo Paciente</DialogTitle>
              <p className="text-sm text-muted-foreground mt-0.5">Registra un nuevo paciente en el sistema</p>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="full_name" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Nombre Completo *
            </Label>
            <Input
              id="full_name"
              name="full_name"
              value={formData.full_name}
              onChange={handleInputChange}
              placeholder="Ej: Juan Pérez"
              required
              className="h-12 rounded-xl"
            />
          </div>

          {/* DNI and Birth Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dni" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                DNI *
              </Label>
              <Input
                id="dni"
                name="dni"
                value={formData.dni}
                onChange={handleInputChange}
                placeholder="12345678"
                required
                className="h-12 rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date_of_birth" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Fecha de Nacimiento
              </Label>
              <Input
                id="date_of_birth"
                name="date_of_birth"
                type="date"
                value={formData.date_of_birth}
                onChange={handleInputChange}
                className="h-12 rounded-xl"
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Correo Electrónico
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="correo@ejemplo.com"
                className="h-12 rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Teléfono
              </Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="+54 9 11 1234-5678"
                className="h-12 rounded-xl"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Notas (Opcional)
            </Label>
            <Textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="Información adicional sobre el paciente..."
              rows={3}
              className="rounded-xl resize-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 h-11 rounded-xl"
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 h-11 rounded-xl gap-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Creando...
                </>
              ) : (
                <>
                  <User className="size-4" />
                  Crear Paciente
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
