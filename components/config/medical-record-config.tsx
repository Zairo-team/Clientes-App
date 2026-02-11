'use client'

import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'
import type { MedicalRecordField } from '@/lib/supabase/client'
import { Loader2, Trash2, Plus } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface Props {
  profileId: string
}

export default function MedicalRecordConfig({ profileId }: Props) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [fields, setFields] = useState<MedicalRecordField[]>([])
  const [newName, setNewName] = useState('')
  const [newType, setNewType] = useState<'text' | 'number' | 'date' | 'textarea' | 'select' | 'checkbox'>('text')
  const [newPlaceholder, setNewPlaceholder] = useState('')
  const [newOptions, setNewOptions] = useState('')

  useEffect(() => {
    if (!profileId) return
    loadFields()
  }, [profileId])

  const loadFields = async () => {
    try {
      setLoading(true)
      const supabase = createClient()
      const { data, error } = await supabase
        .from('medical_record_fields')
        .select('*')
        .eq('professional_id', profileId)
        .order('display_order', { ascending: true })

      if (error) throw error
      setFields(data || [])
    } catch (err: any) {
      console.error(err)
      toast({ title: 'Error', description: err.message || 'No se pudieron cargar los campos', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    if (!newName.trim()) return
    try {
      setCreating(true)
      const supabase = createClient()
      const optionsValue = newType === 'select' && newOptions.trim() ? JSON.stringify(newOptions.split(',').map(s => s.trim())) : null
      const { data, error } = await supabase
        .from('medical_record_fields')
        .insert({
          professional_id: profileId,
          field_name: newName,
          field_type: newType,
          is_required: false,
          display_order: fields.length + 1,
          options: optionsValue,
          placeholder: newPlaceholder,
          is_active: true,
        })
        .select()
        .single()

      if (error) throw error
      setFields(prev => [...prev, data])
      setNewName('')
      setNewPlaceholder('')
      setNewOptions('')
      setNewType('text')
      toast({ title: 'Campo creado', description: 'Se agregó un nuevo campo a la ficha médica.' })
    } catch (err: any) {
      console.error(err)
      toast({ title: 'Error', description: err.message || 'No se pudo crear el campo', variant: 'destructive' })
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = async (fieldId: string) => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('medical_record_fields')
        .update({ is_active: false })
        .eq('id', fieldId)

      if (error) throw error
      setFields(prev => prev.filter(f => f.id !== fieldId))
      toast({ title: 'Campo desactivado', description: 'El campo fue marcado como inactivo.' })
    } catch (err: any) {
      console.error(err)
      toast({ title: 'Error', description: err.message || 'No se pudo eliminar el campo', variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">Configura los campos que estarán disponibles en la ficha médica de cada paciente. Los campos se aplican por profesional.</p>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2 md:col-span-2">
          <Label>Nombre del Campo</Label>
          <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Ej: Peso" />
        </div>

        <div className="space-y-2">
          <Label>Tipo</Label>
          <Select value={newType} onValueChange={(v) => setNewType(v as any)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Seleccionar tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="text">Texto</SelectItem>
              <SelectItem value="number">Número</SelectItem>
              <SelectItem value="date">Fecha</SelectItem>
              <SelectItem value="textarea">Área de texto</SelectItem>
              <SelectItem value="select">Select (opciones)</SelectItem>
              <SelectItem value="checkbox">Checkbox</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {newType === 'select' && (
        <div className="space-y-2">
          <Label>Opciones (separadas por coma)</Label>
          <Input value={newOptions} onChange={(e) => setNewOptions(e.target.value)} placeholder="Opción 1, Opción 2" />
        </div>
      )}

      <div className="space-y-2">
        <Label>Placeholder (opcional)</Label>
        <Input value={newPlaceholder} onChange={(e) => setNewPlaceholder(e.target.value)} placeholder="Ej: 70" />
      </div>

      <div className="flex items-center gap-2">
        <Button onClick={handleCreate} disabled={creating}>
          {creating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
          Crear Campo
        </Button>
      </div>

      <div className="pt-4 border-t">
        <h3 className="font-semibold">Campos actuales</h3>

        {loading ? (
          <div className="py-4"><Loader2 className="animate-spin" /></div>
        ) : fields.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">Aún no hay campos configurados. Al crearlos, estarán disponibles al crear la ficha del paciente.</p>
        ) : (
          <div className="space-y-2 py-2">
            {fields.map((f) => (
              <div key={f.id} className="flex items-center justify-between p-2 rounded-md border bg-muted/20">
                <div>
                  <div className="font-medium">{f.field_name}</div>
                  <div className="text-xs text-muted-foreground">{f.field_type}{f.placeholder ? ` • ${f.placeholder}` : ''}</div>
                </div>
                <div>
                  <Button variant="ghost" onClick={() => handleDelete(f.id)} title="Desactivar campo">
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
