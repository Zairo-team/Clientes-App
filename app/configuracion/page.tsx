'use client'

import { useEffect, useState } from 'react'
import { Sidebar } from "@/components/dashboard/sidebar"
import ProtectedRoute from "@/components/protected-route"
import { useAuth } from "@/lib/auth-context"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { User, Shield, Bell, Loader2, Save, Mail, Phone, Lock, MessageSquare } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { updateProfile } from '@/lib/api/profile'
import { createClient } from '@/lib/supabase/client'

export default function ConfigurationPage() {
    const { profile, user } = useAuth()
    const { toast } = useToast()
    const [loading, setLoading] = useState(false)
    const [sendingReset, setSendingReset] = useState(false)

    // Form State
    const [formData, setFormData] = useState({
        business_name: '',
        professional_title: '',
        phone: '',
        notifications_whatsapp: false,
        notifications_email: false
    })

    // Initialize form with profile data
    useEffect(() => {
        if (profile) {
            setFormData({
                business_name: profile.business_name || '',
                professional_title: profile.professional_title || '',
                phone: profile.phone || '',
                notifications_whatsapp: profile.notifications_whatsapp || false,
                notifications_email: profile.notifications_email || false
            })
        }
    }, [profile])

    const handleSave = async () => {
        if (!profile) return

        try {
            setLoading(true)
            await updateProfile(profile.id, {
                business_name: formData.business_name,
                professional_title: formData.professional_title,
                phone: formData.phone,
                notifications_whatsapp: formData.notifications_whatsapp,
                notifications_email: formData.notifications_email
            })

            toast({
                title: 'Cambios guardados',
                description: 'Tu configuración ha sido actualizada correctamente.',
            })
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'No se pudieron guardar los cambios.',
                variant: 'destructive',
            })
        } finally {
            setLoading(false)
        }
    }

    const handlePasswordReset = async () => {
        if (!profile?.email) return

        try {
            setSendingReset(true)
            const supabase = createClient()
            const { error } = await supabase.auth.resetPasswordForEmail(profile.email, {
                redirectTo: `${window.location.origin}/auth/reset-password`,
            })

            if (error) throw error

            toast({
                title: 'Correo enviado',
                description: 'Revisa tu bandeja de entrada para restablecer tu contraseña.',
            })
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'No se pudo enviar el correo de recuperación.',
                variant: 'destructive',
            })
        } finally {
            setSendingReset(false)
        }
    }

    if (!profile) return null

    return (
        <ProtectedRoute>
            <div className="flex h-screen overflow-hidden bg-background">
                <Sidebar currentPage="configuration" />

                <main className="flex-1 overflow-auto">
                    <div className="max-w-[1000px] mx-auto p-4 md:p-8 space-y-8">
                        {/* Header */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Configuración</h1>
                                <p className="text-muted-foreground mt-1">
                                    Administra tu perfil, seguridad y preferencias de notificaciones.
                                </p>
                            </div>
                            <Button size="lg" onClick={handleSave} disabled={loading}>
                                {loading ? (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                    <Save className="w-4 h-4 mr-2" />
                                )}
                                Guardar Cambios
                            </Button>
                        </div>

                        {/* Profile Section */}
                        <section className="bg-card rounded-xl border p-6 shadow-sm space-y-6">
                            <div className="flex items-center gap-3 border-b pb-4">
                                <User className="w-5 h-5 text-primary" />
                                <h2 className="text-lg font-bold">Perfil Profesional</h2>
                            </div>

                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="business_name">Nombre del Negocio / Clínica</Label>
                                    <Input
                                        id="business_name"
                                        value={formData.business_name}
                                        onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                                        placeholder="Ej: Clínica Central de Bienestar"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="professional_title">Especialidad / Título</Label>
                                    <Input
                                        id="professional_title"
                                        value={formData.professional_title}
                                        onChange={(e) => setFormData({ ...formData, professional_title: e.target.value })}
                                        placeholder="Ej: Psicólogo Clínico"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Correo Electrónico de Contacto</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            value={profile.email}
                                            disabled
                                            className="pl-9 bg-muted/50"
                                        />
                                    </div>
                                    <p className="text-xs text-muted-foreground">El email de acceso no se puede cambiar aquí.</p>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Teléfono Profesional</Label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            id="phone"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className="pl-9"
                                            placeholder="+54 9 11 1234 5678"
                                        />
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Security Section */}
                        <section className="bg-card rounded-xl border p-6 shadow-sm space-y-6">
                            <div className="flex items-center gap-3 border-b pb-4">
                                <Shield className="w-5 h-5 text-blue-600" />
                                <h2 className="text-lg font-bold">Seguridad</h2>
                            </div>

                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-muted/30 rounded-lg border">
                                <div className="space-y-1">
                                    <h3 className="font-semibold flex items-center gap-2">
                                        <Lock className="w-4 h-4 text-muted-foreground" />
                                        Contraseña de acceso
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        Te enviaremos un correo para restablecer tu contraseña de forma segura.
                                    </p>
                                </div>
                                <Button
                                    variant="outline"
                                    onClick={handlePasswordReset}
                                    disabled={sendingReset}
                                >
                                    {sendingReset ? (
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    ) : (
                                        'Solicitar cambio de contraseña'
                                    )}
                                </Button>
                            </div>
                        </section>

                        {/* Notifications Section */}
                        <section className="bg-card rounded-xl border p-6 shadow-sm space-y-6">
                            <div className="flex items-center gap-3 border-b pb-4">
                                <Bell className="w-5 h-5 text-amber-500" />
                                <h2 className="text-lg font-bold">Notificaciones</h2>
                            </div>

                            <div className="space-y-6">
                                <div className="flex items-start justify-between">
                                    <div className="space-y-1">
                                        <h3 className="font-medium flex items-center gap-2">
                                            <MessageSquare className="w-4 h-4 text-green-600" />
                                            Alertas vía WhatsApp
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            Enviar recordatorios automáticos de citas a los pacientes.
                                        </p>
                                    </div>
                                    <Switch
                                        checked={formData.notifications_whatsapp}
                                        onCheckedChange={(checked) => setFormData({ ...formData, notifications_whatsapp: checked })}
                                    />
                                </div>
                                <Separator />
                                <div className="flex items-start justify-between">
                                    <div className="space-y-1">
                                        <h3 className="font-medium flex items-center gap-2">
                                            <Mail className="w-4 h-4 text-blue-500" />
                                            Alertas vía Email
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            Enviar facturas y confirmaciones de reserva por correo electrónico.
                                        </p>
                                    </div>
                                    <Switch
                                        checked={formData.notifications_email}
                                        onCheckedChange={(checked) => setFormData({ ...formData, notifications_email: checked })}
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Save Button */}

                    </div>
                </main>
            </div>
        </ProtectedRoute>
    )
}
