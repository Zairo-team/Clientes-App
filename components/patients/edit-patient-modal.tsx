'use client'

import { useState, FormEvent, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/lib/auth-context'
import { updatePatient } from '@/lib/api/patients'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Edit } from 'lucide-react'
import type { Patient } from '@/lib/supabase/client'

interface EditPatientModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    patient: Patient | null
    onPatientUpdated: () => void
}

export function EditPatientModal({ open, onOpenChange, patient, onPatientUpdated }: EditPatientModalProps) {
    const { profile } = useAuth()
    const { toast } = useToast()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        full_name: '',
        dni: '',
        date_of_birth: '',
        email: '',
        phone: '',
        notes: '',
    })

    // Load patient data when patient changes
    useEffect(() => {
        if (patient) {
            setFormData({
                full_name: patient.full_name || '',
                dni: patient.dni || '',
                date_of_birth: patient.date_of_birth || '',
                email: patient.email || '',
                phone: patient.phone || '',
                notes: patient.notes || '',
            })
        }
    }, [patient])

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        if (!profile?.id || !patient?.id) return

        setLoading(true)
        try {
            await updatePatient(patient.id, {
                full_name: formData.full_name,
                dni: formData.dni, // DNI is now required
                email: formData.email || null,
                phone: formData.phone || null,
                date_of_birth: formData.date_of_birth || null,
                notes: formData.notes || null,
            })

            toast({
                title: '¡Paciente actualizado!',
                description: `Los cambios en ${formData.full_name} se guardaron correctamente.`,
            })

            onOpenChange(false)
            onPatientUpdated()
        } catch (error: any) {
            let errorMessage = error.message || 'No se pudo actualizar el paciente'

            // Check for duplicate DNI error
            if (error.message?.includes('duplicate') || error.message?.includes('unique') || error.code === '23505') {
                errorMessage = 'Ya existe otro paciente con este DNI en el sistema'
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
                            <Edit className="size-5" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl font-bold">Editar Paciente</DialogTitle>
                            <p className="text-sm text-muted-foreground mt-0.5">Actualiza la información del paciente</p>
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
                                    Actualizando...
                                </>
                            ) : (
                                <>
                                    <Edit className="size-4" />
                                    Guardar Cambios
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
