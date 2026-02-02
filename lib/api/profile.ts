import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/lib/supabase/client'

/**
 * Update user profile details
 */
export async function updateProfile(
    userId: string,
    updates: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at' | 'email'>>
) {
    const supabase = createClient()

    const { data, error } = await supabase
        .from('profiles')
        .update({
            ...updates,
            updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single()

    if (error) {
        throw new Error(`Error al actualizar perfil: ${error.message}`)
    }

    return data
}
