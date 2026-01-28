'use client'

import { useState, FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Check, Plus, Loader2 } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { createService } from '@/lib/api/services'
import { useToast } from '@/hooks/use-toast'

interface NewServiceModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onServiceCreated: () => void
}

const colorOptions = [
  { name: "Azul", value: "blue", color: "bg-blue-500" },
  { name: "Púrpura", value: "purple", color: "bg-purple-500" },
  { name: "Verde", value: "emerald", color: "bg-emerald-500" },
  { name: "Naranja", value: "orange", color: "bg-orange-500" },
  { name: "Rosa", value: "rose", color: "bg-rose-500" },
  { name: "Cian", value: "cyan", color: "bg-cyan-500" },
  { name: "Ámbar", value: "amber", color: "bg-amber-500" },
]

export function NewServiceModal({ open, onOpenChange, onServiceCreated }: NewServiceModalProps) {
  const { profile } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    duration_minutes: '60',
    price: '',
    color: 'blue',
  })

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!profile?.id) return

    setLoading(true)
    try {
      await createService({
        professional_id: profile.id,
        name: formData.name,
        category: formData.category,
        description: formData.description || null,
        duration_minutes: parseInt(formData.duration_minutes),
        price: parseFloat(formData.price),
        color: formData.color,
        is_active: true,
      })

      toast({
        title: '¡Servicio creado!',
        description: `${formData.name} ha sido agregado al catálogo.`,
      })

      // Reset form
      setFormData({
        name: '',
        category: '',
        description: '',
        duration_minutes: '60',
        price: '',
        color: 'blue',
      })

      onOpenChange(false)
      onServiceCreated()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo crear el servicio',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex justify-between items-start">
            <div>
              <DialogTitle className="text-2xl font-black tracking-tight">
                Nuevo Servicio
              </DialogTitle>
              <p className="text-muted-foreground text-xs mt-2 uppercase tracking-widest font-bold">
                Crea un servicio personalizado
              </p>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Nombre del Servicio */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="service-name" className="font-bold">
              Nombre del Servicio *
            </Label>
            <Input
              id="service-name"
              placeholder="Ej: Terapia Individual, Consulta Nutricional..."
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="h-11"
              required
            />
          </div>

          {/* Categoría */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="category" className="font-bold">
              Categoría *
            </Label>
            <Input
              id="category"
              placeholder="Ej: Terapia, Nutrición, Consulta..."
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="h-11"
              required
            />
          </div>

          {/* Color Selection */}
          <div className="flex flex-col gap-3">
            <Label className="font-bold">Color del servicio</Label>
            <div className="flex flex-wrap gap-4">
              {colorOptions.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, color: color.value })}
                  className={`group relative size-8 rounded-full ${color.color} flex items-center justify-center hover:scale-110 transition-transform ${formData.color === color.value
                      ? "ring-2 ring-offset-2 ring-primary ring-offset-background"
                      : ""
                    }`}
                  title={color.name}
                >
                  {formData.color === color.value && (
                    <Check className="size-4 text-white font-bold" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Descripción */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="description" className="font-bold">
              Descripción
            </Label>
            <Textarea
              id="description"
              placeholder="Describe brevemente qué incluye este servicio..."
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="resize-none"
            />
          </div>

          {/* Duración y Precio */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="duration" className="font-bold">
                Duración *
              </Label>
              <Select
                value={formData.duration_minutes}
                onValueChange={(value) => setFormData({ ...formData, duration_minutes: value })}
              >
                <SelectTrigger id="duration" className="h-11">
                  <SelectValue placeholder="Seleccionar duración" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 min</SelectItem>
                  <SelectItem value="45">45 min</SelectItem>
                  <SelectItem value="60">60 min</SelectItem>
                  <SelectItem value="90">90 min</SelectItem>
                  <SelectItem value="120">120 min</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="price" className="font-bold">
                Precio (ARS) *
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                  $
                </span>
                <Input
                  id="price"
                  type="number"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="pl-7 h-11"
                  required
                />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="font-bold"
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="font-bold">
              {loading ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Creando...
                </>
              ) : (
                'Guardar Servicio'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
