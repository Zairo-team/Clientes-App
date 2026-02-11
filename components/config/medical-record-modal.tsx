'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { FileText } from 'lucide-react'
import { useMedicalRecordFields } from '@/hooks/use-medical-record-fields'
import type { MedicalRecordField } from '@/lib/supabase/client'
import NewFieldForm from './new-field-form'
import FieldsList from './fields-list'

interface MedicalRecordModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  profileId: string | null
}

export default function MedicalRecordModal({
  open,
  onOpenChange,
  profileId,
}: MedicalRecordModalProps) {
  const { fields, loading, creating, createField, updateField, deleteField } =
    useMedicalRecordFields(open ? profileId : null)
  const [editingField, setEditingField] = useState<MedicalRecordField | null>(null)

  if (!profileId) return null

  const handleCreateField = async (
    name: string,
    type: 'text' | 'number' | 'date' | 'textarea' | 'select' | 'checkbox' | 'multi-input',
    placeholder: string,
    options?: string[]
  ) => {
    if (editingField) {
      await updateField(editingField.id, name, type, placeholder, options)
      setEditingField(null)
    } else {
      await createField(name, type, placeholder, options)
    }
  }

  const handleEditField = (field: MedicalRecordField) => {
    setEditingField(field)
  }

  const handleCancelEdit = () => {
    setEditingField(null)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <div>
              <DialogTitle>Configurar Ficha Médica</DialogTitle>
              <DialogDescription className="mt-2">
                Define los campos personalizados que aparecerán en la ficha
                médica de cada paciente.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Separator className="my-4" />

        <div className="space-y-6 overflow-y-auto flex-1 pr-4">
          <NewFieldForm
            onSubmit={handleCreateField}
            onCancel={handleCancelEdit}
            editingField={editingField}
            isLoading={creating}
          />

          <FieldsList
            fields={fields}
            loading={loading}
            onDelete={deleteField}
            onEdit={handleEditField}
            isDeleting={creating}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
