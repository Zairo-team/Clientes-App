import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { MedicalRecordField } from '@/lib/supabase/client'
import { useToast } from './use-toast'

export function useMedicalRecordFields(profileId: string | null) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [fields, setFields] = useState<MedicalRecordField[]>([])

  useEffect(() => {
    if (!profileId) return
    loadFields()
  }, [profileId])

  const loadFields = async () => {
    if (!profileId) return
    try {
      setLoading(true)
      const supabase = createClient()
      const { data, error } = await (supabase
        .from('medical_record_fields') as any)
        .select('*')
        .eq('professional_id', profileId)
        .eq('is_active', true)
        .order('display_order', { ascending: true })

      if (error) throw error
      setFields(data || [])
    } catch (err: any) {
      console.error(err)
      toast({
        title: 'Error',
        description: err.message || 'No se pudieron cargar los campos',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const createField = async (
    fieldName: string,
    fieldType: 'text' | 'number' | 'date' | 'textarea' | 'select' | 'checkbox' | 'multi-input',
    placeholder: string,
    options?: string[]
  ) => {
    if (!profileId || !fieldName.trim()) return null

    try {
      setCreating(true)
      const supabase = createClient()
      const optionsValue =
        (fieldType === 'select' || fieldType === 'multi-input' || fieldType === 'checkbox') && options?.length
          ? JSON.stringify(options)
          : null

      const { data, error } = await (supabase
        .from('medical_record_fields') as any)
        .insert({
          professional_id: profileId,
          field_name: fieldName,
          field_type: fieldType,
          is_required: false,
          display_order: fields.length + 1,
          options: optionsValue,
          placeholder,
          is_active: true,
        })
        .select()
        .single()

      if (error) throw error

      setFields((prev) => [...prev, data as MedicalRecordField])
      toast({
        title: 'Campo creado',
        description: 'Se agregó un nuevo campo a la ficha médica.',
      })

      return data
    } catch (err: any) {
      console.error(err)
      toast({
        title: 'Error',
        description: err.message || 'No se pudo crear el campo',
        variant: 'destructive',
      })
      return null
    } finally {
      setCreating(false)
    }
  }

  const deleteField = async (fieldId: string) => {
    try {
      const supabase = createClient()
      const { error } = await (supabase
        .from('medical_record_fields') as any)
        .update({ is_active: false })
        .eq('id', fieldId)

      if (error) throw error

      setFields((prev) => prev.filter((f) => f.id !== fieldId))
      toast({
        title: 'Campo desactivado',
        description: 'El campo fue marcado como inactivo.',
      })
    } catch (err: any) {
      console.error(err)
      toast({
        title: 'Error',
        description: err.message || 'No se pudo eliminar el campo',
        variant: 'destructive',
      })
    }
  }

  const updateField = async (
    fieldId: string,
    fieldName: string,
    fieldType: 'text' | 'number' | 'date' | 'textarea' | 'select' | 'checkbox' | 'multi-input',
    placeholder: string,
    options?: string[]
  ) => {
    if (!fieldName.trim()) return null

    try {
      setCreating(true)
      const supabase = createClient()
      const optionsValue =
        (fieldType === 'select' || fieldType === 'multi-input' || fieldType === 'checkbox') && options?.length
          ? JSON.stringify(options)
          : null

      const { data, error } = await (supabase
        .from('medical_record_fields') as any)
        .update({
          field_name: fieldName,
          field_type: fieldType,
          placeholder,
          options: optionsValue,
        })
        .eq('id', fieldId)
        .select()
        .single()

      if (error) throw error

      setFields((prev) =>
        prev.map((f) => (f.id === fieldId ? (data as MedicalRecordField) : f))
      )
      toast({
        title: 'Campo actualizado',
        description: 'Los cambios se guardaron correctamente.',
      })

      return data
    } catch (err: any) {
      console.error(err)
      toast({
        title: 'Error',
        description: err.message || 'No se pudo actualizar el campo',
        variant: 'destructive',
      })
      return null
    } finally {
      setCreating(false)
    }
  }

  return {
    fields,
    loading,
    creating,
    createField,
    updateField,
    deleteField,
    reloadFields: loadFields,
  }
}
