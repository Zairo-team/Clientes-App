"use server"

import { createClient } from "@/lib/supabase/server"
import { type Patient, type Profile } from "@/lib/supabase/client"

type Input = {
    full_name: string
    email?: string | null
    phone?: string | null
    dni: string
    notes?: string | null
    date_of_birth?: string | null
}

export async function createPatientAction(input: Input) {
    const supabase = await createClient()

    // 1. Get Logged Professional
    const { data: auth, error: authError } = await supabase.auth.getUser()
    const professional = auth?.user

    if (authError || !professional) {
        throw new Error("No autenticado")
    }

    // 2. Get Professional Profile (for business name)
    const { data: profileResult } = await supabase
        .from("profiles")
        .select("full_name, business_name, email")
        .eq("id", professional.id)
        .single()

    const profile = profileResult as unknown as Profile // Force cast or ensure it's Profile

    // 3. Create Patient
    // Explicitly cast the result to avoid 'never' inference issues
    const { data, error } = await supabase
        .from("patients")
        .insert({
            professional_id: professional.id,
            full_name: input.full_name,
            dni: input.dni,
            email: input.email ?? null,
            phone: input.phone ?? null,
            notes: input.notes ?? null,
            date_of_birth: input.date_of_birth ?? null,
            status: 'active'
        } as any)
        .select()
        .single()

    if (error || !data) {
        console.error("Error creating patient:", error)
        throw new Error(error?.message || "Error creating patient")
    }

    // Cast strictly to Patient type for internal use and return
    const patient = data as unknown as Patient

    // 4. Activity Log
    await supabase.from("activity_log").insert({
        professional_id: professional.id,
        activity_type: "patient_created",
        patient_id: patient.id,
        title: "Paciente creado",
        description: `Se creó el paciente ${patient.full_name}`,
    } as any)

    return { ok: true, patient }

    return { ok: true, patient }
}
