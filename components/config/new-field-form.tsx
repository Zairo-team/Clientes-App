'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, Plus, X } from 'lucide-react'
import type { MedicalRecordField } from '@/lib/supabase/client'

interface NewFieldFormProps {
  onSubmit: (
    name: string,
    type: 'text' | 'number' | 'date' | 'textarea' | 'select' | 'checkbox' | 'multi-input',
    placeholder: string,
    options?: string[]
  ) => Promise<void>
  onCancel?: () => void
  editingField?: MedicalRecordField | null
  isLoading?: boolean
}

export default function NewFieldForm({
  onSubmit,
  onCancel,
  editingField,
  isLoading = false,
}: NewFieldFormProps) {
  const [newName, setNewName] = useState('')
  const [newType, setNewType] = useState<
    'text' | 'number' | 'date' | 'textarea' | 'select' | 'checkbox' | 'multi-input'
  >('text')
  const [newPlaceholder, setNewPlaceholder] = useState('')
  const [newOptions, setNewOptions] = useState('')

  // Cargar datos si estamos editando
  useEffect(() => {
    if (editingField) {
      setNewName(editingField.field_name)
      setNewType(editingField.field_type as any)
      setNewPlaceholder(editingField.placeholder || '')
      if (editingField.options && Array.isArray(editingField.options)) {
        setNewOptions(editingField.options.join(', '))
      } else if (editingField.options && typeof editingField.options === 'string') {
        const parsed = JSON.parse(editingField.options)
        setNewOptions(Array.isArray(parsed) ? parsed.join(', ') : '')
      }
    } else {
      resetForm()
    }
  }, [editingField])

  const resetForm = () => {
    setNewName('')
    setNewPlaceholder('')
    setNewOptions('')
    setNewType('text')
  }

  const handleSubmit = async () => {
    const options =
      (newType === 'select' || newType === 'multi-input' || newType === 'checkbox') && newOptions.trim()
        ? newOptions.split(',').map((s) => s.trim())
        : undefined

    await onSubmit(newName, newType, newPlaceholder, options)

    if (!editingField) {
      resetForm()
    }
  }

  const handleCancel = () => {
    resetForm()
    onCancel?.()
  }

  const isFormValid = newName.trim().length > 0
  const isEditing = !!editingField

  return (
    <div className="space-y-4 p-4 bg-muted/30 rounded-lg border">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">
          {isEditing ? 'Editar campo' : 'Agregar nuevo campo'}
        </h3>
        {isEditing && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            disabled={isLoading}
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2 md:col-span-2">
          <Label>Nombre del Campo</Label>
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Ej: Peso"
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <Label>Tipo</Label>
          <Select value={newType} onValueChange={(v) => setNewType(v as any)}>
            <SelectTrigger className="w-full" disabled={isLoading}>
              <SelectValue placeholder="Seleccionar tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="text">Texto</SelectItem>
              <SelectItem value="number">Número</SelectItem>
              <SelectItem value="date">Fecha</SelectItem>
              <SelectItem value="textarea">Área de texto</SelectItem>
              <SelectItem value="select">Select (opciones)</SelectItem>
              <SelectItem value="checkbox">Checkbox</SelectItem>
                          <SelectItem value="multi-input">Multi-Input (tags)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {(newType === 'select' || newType === 'multi-input' || newType === 'checkbox') && (
        <div className="space-y-2">
          <Label>Opciones (separadas por coma)</Label>
          <Input
            value={newOptions}
            onChange={(e) => setNewOptions(e.target.value)}
            placeholder="Opción 1, Opción 2, Opción 3"
            disabled={isLoading}
          />
        </div>
      )}

      <div className="space-y-2">
        <Label>Placeholder (opcional)</Label>
        <Input
          value={newPlaceholder}
          onChange={(e) => setNewPlaceholder(e.target.value)}
          placeholder="Ej: 70"
          disabled={isLoading}
        />
      </div>

      <div className="flex gap-2">
        <Button
          onClick={handleSubmit}
          disabled={!isFormValid || isLoading}
          className="flex-1"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Plus className="w-4 h-4 mr-2" />
          )}
          {isEditing ? 'Guardar cambios' : 'Crear Campo'}
        </Button>
        {isEditing && (
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
          >
            Cancelar
          </Button>
        )}
      </div>
    </div>
  )
}
