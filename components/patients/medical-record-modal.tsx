'use client'

import React, { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Patient, MedicalRecordField } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  patient: Patient
  professionalId: string
  onSaved?: () => void
}

export default function MedicalRecordModal({ open, onOpenChange, patient, professionalId, onSaved }: Props) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [fields, setFields] = useState<MedicalRecordField[]>([])
  const [medicalRecordId, setMedicalRecordId] = useState<string | null>(null)
  const [formData, setFormData] = useState<Record<string, any>>({})

  useEffect(() => {
    if (open && patient?.id) {
      loadData()
    }
  }, [open, patient?.id])

  const loadData = async () => {
    try {
      setLoading(true)
      const supabase = createClient()

      // Load fields
      let { data: loadedFields, error: fieldsError } = await supabase
        .from('medical_record_fields')
        .select('*')
        .eq('professional_id', professionalId)
        .eq('is_active', true)
        .order('display_order', { ascending: true })

      if (fieldsError) throw fieldsError

      // If no fields exist, create defaults
      if (!loadedFields || (Array.isArray(loadedFields) && loadedFields.length === 0)) {
        const defaultFields = [
          { professional_id: professionalId, field_name: 'Weight (kg)', field_type: 'number', is_required: false, display_order: 1, placeholder: '70', is_active: true },
          { professional_id: professionalId, field_name: 'Height (cm)', field_type: 'number', is_required: false, display_order: 2, placeholder: '170', is_active: true },
          { professional_id: professionalId, field_name: 'Blood Pressure', field_type: 'text', is_required: false, display_order: 3, placeholder: 'Ex: 120/80', is_active: true },
          { professional_id: professionalId, field_name: 'Medical History', field_type: 'textarea', is_required: false, display_order: 4, is_active: true },
          { professional_id: professionalId, field_name: 'Allergies', field_type: 'textarea', is_required: false, display_order: 5, is_active: true },
          { professional_id: professionalId, field_name: 'Current Medications', field_type: 'textarea', is_required: false, display_order: 6, is_active: true },
        ]
        const { data: createdFields, error: createError } = await supabase.from('medical_record_fields').insert(defaultFields).select()
        if (createError) throw createError
        loadedFields = createdFields || []
      }

      setFields(loadedFields as MedicalRecordField[])

      // Load or create medical record
      const { data: recordData, error: recordError } = await supabase
        .from('medical_records')
        .select('*')
        .eq('patient_id', patient.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (recordError) throw recordError

      let recordId: string | null = null
      if (!recordData) {
        const { data: newRecord, error: createRecordError } = await supabase
          .from('medical_records')
          .insert({
            professional_id: professionalId,
            patient_id: patient.id,
            title: 'Medical Record',
            patient_full_name: patient.full_name,
            patient_dni: patient.dni || null,
            patient_age: null,
            patient_phone: patient.phone || null,
            patient_email: patient.email || null,
          })
          .select()
          .single()

        if (createRecordError) throw createRecordError
        recordId = newRecord.id
      } else {
        recordId = recordData.id
      }

      setMedicalRecordId(recordId)

      // Load record data
      const { data: recordValues, error: valuesError } = await supabase
        .from('medical_record_data')
        .select('*')
        .eq('medical_record_id', recordId)

      if (valuesError) throw valuesError

      const initialForm: Record<string, any> = {};
      ;(recordValues || []).forEach((rv: any) => {
        initialForm[rv.field_id] = rv.value
      })

      setFormData(initialForm)

    } catch (err: any) {
      console.error(err)
      toast({ title: 'Error', description: err.message || 'No se pudo cargar la ficha médica', variant: 'destructive' })
      onOpenChange(false)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (fieldId: string, value: any) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }))
  }

  const handleSave = async () => {
    if (!medicalRecordId) return
    try {
      setSaving(true)
      const supabase = createClient()

      // Delete existing
      await supabase.from('medical_record_data').delete().eq('medical_record_id', medicalRecordId)

      const toInsert = fields.map((f) => ({ medical_record_id: medicalRecordId, field_id: f.id, value: formData[f.id] ?? null }))

      const { error } = await supabase.from('medical_record_data').insert(toInsert).select()
      if (error) throw error

      toast({ title: 'Ficha guardada', description: 'Los datos de la ficha médica fueron guardados.' })
      onSaved?.()
      onOpenChange(false)
    } catch (err: any) {
      console.error(err)
      toast({ title: 'Error', description: err.message || 'No se pudo guardar la ficha', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ficha Médica — {patient.full_name}</DialogTitle>
          <DialogDescription>Ver y editar la ficha médica del paciente.</DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="py-8 text-center"><Loader2 className="animate-spin mx-auto" /></div>
        ) : (
          <div className="space-y-4">
            {fields.map((f) => (
              <div key={f.id} className="space-y-1">
                <Label className="text-sm font-medium">{f.field_name}{f.is_required ? ' *' : ''}</Label>
                {f.field_type === 'text' && (
                  <Input value={formData[f.id] ?? ''} onChange={(e) => handleChange(f.id, e.target.value)} />
                )}
                {f.field_type === 'number' && (
                  <Input type="number" value={formData[f.id] ?? ''} onChange={(e) => handleChange(f.id, e.target.value)} />
                )}
                {f.field_type === 'date' && (
                  <Input type="date" value={formData[f.id] ?? ''} onChange={(e) => handleChange(f.id, e.target.value)} />
                )}
                {f.field_type === 'textarea' && (
                  <Textarea value={formData[f.id] ?? ''} onChange={(e) => handleChange(f.id, e.target.value)} />
                )}
                {f.field_type === 'select' && (
                  <Select value={formData[f.id] ?? ''} onValueChange={(v) => handleChange(f.id, v)}>
                    <SelectTrigger className="w-full"><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                    <SelectContent>
                      {(f.options ? JSON.parse(f.options) : []).map((opt: string, idx: number) => (
                        <SelectItem key={idx} value={opt}>{opt}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {f.field_type === 'checkbox' && (
                  <Checkbox checked={!!formData[f.id]} onCheckedChange={(v) => handleChange(f.id, v)} />
                )}
              </div>
            ))}

            <div className="flex items-center justify-end gap-2 pt-4">
              <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={saving}>Cancelar</Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Guardar
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
