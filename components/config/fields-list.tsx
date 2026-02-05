'use client'

import { Button } from '@/components/ui/button'
import { Loader2, Trash2, Edit2 } from 'lucide-react'
import type { MedicalRecordField } from '@/lib/supabase/client'

interface FieldsListProps {
  fields: MedicalRecordField[]
  loading: boolean
  onDelete: (fieldId: string) => Promise<void>
  onEdit: (field: MedicalRecordField) => void
  isDeleting?: boolean
}

export default function FieldsList({
  fields,
  loading,
  onDelete,
  onEdit,
  isDeleting = false,
}: FieldsListProps) {
  if (loading) {
    return (
      <div className="py-8 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (fields.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-sm text-muted-foreground">
          Aún no hay campos configurados. Al crearlos, estarán disponibles al
          crear la ficha del paciente.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <h3 className="font-semibold text-sm">Campos configurados</h3>
      <div className="space-y-2">
        {fields.map((field) => (
          <div
            key={field.id}
            className="flex items-center justify-between p-3 rounded-md border bg-card hover:bg-muted/50 transition-colors"
          >
            <div className="flex-1">
              <div className="font-medium text-sm">{field.field_name}</div>
              <div className="text-xs text-muted-foreground">
                {field.field_type}
                {field.placeholder ? ` • ${field.placeholder}` : ''}
                {field.options && ` • ${field.options.length} opciones`}
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(field)}
                disabled={isDeleting}
                title="Editar campo"
              >
                <Edit2 className="w-4 h-4 text-blue-600" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(field.id)}
                disabled={isDeleting}
                title="Desactivar campo"
              >
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
