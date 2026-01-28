"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  X,
  Calendar,
  Clock,
  MessageSquare,
  FileText,
  CheckSquare,
  Save,
  CalendarCheck,
  CheckCircle,
  Bold,
  Italic,
  List,
  Link as LinkIcon,
  Plus,
  History,
  ArrowRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"

export default function NewSessionPage() {
  const router = useRouter()
  const [consultReason, setConsultReason] = useState("")
  const [clinicalNotes, setClinicalNotes] = useState("")
  const [newTask, setNewTask] = useState("")

  // Mock patient data
  const patient = {
    name: "Juan Pérez",
    age: "34 años",
    gender: "Varón",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
  }

  const sessionInfo = {
    date: "24 de Octubre, 2023",
    time: "17:00 - 18:00",
  }

  const lastSession = {
    number: 12,
    date: "12 Oct",
    notes:
      "Mejora significativa en ansiedad laboral. Practicamos respiración diafragmática. El paciente sigue preocupado por la reunión de fin de mes.",
  }

  const recentHistory = [
    { number: 11, date: "05 Oct", type: "Teleconsulta" },
    { number: 10, date: "28 Sep", type: "Presencial" },
  ]

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 md:px-6 py-3 md:py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 md:gap-4 min-w-0">
          <button
            onClick={() => router.back()}
            className="flex items-center justify-center size-9 md:size-10 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
          >
            <X className="size-4 md:size-5" />
          </button>
          <div className="hidden md:block h-8 w-px bg-slate-200 dark:border-slate-800 mx-2" />
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base md:text-lg font-bold text-slate-900 dark:text-white truncate">
                Nueva Sesión
              </h1>
              <span className="hidden md:inline text-slate-400 font-normal">—</span>
              <span className="text-primary font-semibold text-sm md:text-base">{patient.name}</span>
            </div>
            <div className="flex items-center gap-2 md:gap-3 text-xs md:text-sm text-slate-500">
              <span className="flex items-center gap-1">
                <Calendar className="size-3 md:size-3.5" />
                <span className="hidden sm:inline">{sessionInfo.date}</span>
                <span className="sm:hidden">24 Oct</span>
              </span>
              <span className="flex items-center gap-1">
                <Clock className="size-3 md:size-3.5" />
                {sessionInfo.time}
              </span>
            </div>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-3">
          <div className="flex items-center gap-1 px-2 md:px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-lg text-[10px] md:text-xs font-bold uppercase tracking-wider">
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="hidden md:inline">Guardado automático</span>
            <span className="md:hidden">Auto</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden">
        {/* Left Panel - Form */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12">
          <div className="max-w-4xl mx-auto space-y-6 md:space-y-10 pb-24 md:pb-20">
            {/* Consultation Reason */}
            <section className="space-y-3 md:space-y-4">
              <div className="flex items-center gap-2 text-slate-400">
                <MessageSquare className="size-4 md:size-5" />
                <h2 className="text-[10px] md:text-xs font-bold uppercase tracking-[0.15em]">
                  Motivo de Consulta
                </h2>
              </div>
              <Textarea
                value={consultReason}
                onChange={(e) => setConsultReason(e.target.value)}
                placeholder="Escribe el motivo principal de la sesión..."
                className="w-full bg-transparent border-none focus-visible:ring-0 text-lg md:text-xl font-medium placeholder:text-slate-300 dark:placeholder:text-slate-700 resize-none p-0 min-h-[50px] md:min-h-[60px]"
              />
            </section>

            <hr className="border-slate-100 dark:border-slate-800" />

            {/* Clinical Notes */}
            <section className="space-y-3 md:space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-slate-400">
                  <FileText className="size-4 md:size-5" />
                  <h2 className="text-[10px] md:text-xs font-bold uppercase tracking-[0.15em]">
                    Notas Clínicas
                  </h2>
                </div>
                <div className="flex items-center gap-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-1 self-start">
                  <Button variant="ghost" size="sm" className="p-1.5 h-auto">
                    <Bold className="size-3.5" />
                  </Button>
                  <Button variant="ghost" size="sm" className="p-1.5 h-auto">
                    <Italic className="size-3.5" />
                  </Button>
                  <Button variant="ghost" size="sm" className="p-1.5 h-auto">
                    <List className="size-3.5" />
                  </Button>
                  <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-1" />
                  <Button variant="ghost" size="sm" className="p-1.5 h-auto">
                    <LinkIcon className="size-3.5" />
                  </Button>
                </div>
              </div>
              <div className="min-h-[250px] md:min-h-[400px] bg-white dark:bg-slate-900/50 rounded-xl md:rounded-2xl border border-slate-200 dark:border-slate-800 p-4 md:p-6 focus-within:border-primary/50 transition-colors">
                <Textarea
                  value={clinicalNotes}
                  onChange={(e) => setClinicalNotes(e.target.value)}
                  placeholder="Comienza a escribir las notas clínicas aquí..."
                  className="w-full h-full bg-transparent border-none focus-visible:ring-0 text-sm md:text-base text-slate-700 dark:text-slate-300 leading-relaxed placeholder:text-slate-300 dark:placeholder:text-slate-700 resize-none p-0 min-h-[200px] md:min-h-[350px]"
                />
              </div>
            </section>

            {/* Tasks and Agreements */}
            <section className="space-y-3 md:space-y-4">
              <div className="flex items-center gap-2 text-slate-400">
                <CheckSquare className="size-4 md:size-5" />
                <h2 className="text-[10px] md:text-xs font-bold uppercase tracking-[0.15em]">
                  Tareas y Acuerdos
                </h2>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2 md:gap-3 p-3 bg-slate-100/50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                  <Plus className="size-4 md:size-5 text-slate-400 shrink-0" />
                  <Input
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    placeholder="Agregar tarea para el paciente..."
                    className="bg-transparent border-none focus-visible:ring-0 text-sm p-0 h-auto"
                  />
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Right Sidebar - Reference */}
        <aside className="w-80 border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hidden xl:flex flex-col">
          <div className="p-6 border-b border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <History className="size-4 text-primary" />
              Referencia Rápida
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            {/* Last Session */}
            <div className="space-y-3">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Última Sesión ({lastSession.date})
              </h4>
              <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl text-xs text-slate-600 dark:text-slate-400 leading-relaxed border border-slate-100 dark:border-slate-800">
                "{lastSession.notes}"
              </div>
              <button className="text-primary text-[11px] font-bold hover:underline flex items-center gap-1">
                Ver notas completas <ArrowRight className="size-3" />
              </button>
            </div>

            {/* Recent History */}
            <div className="space-y-3">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Historial Reciente
              </h4>
              <div className="space-y-4">
                {recentHistory.map((session, index) => (
                  <div
                    key={session.number}
                    className={`relative pl-6 ${
                      index < recentHistory.length - 1
                        ? "before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-0 before:w-px before:bg-slate-200 dark:before:bg-slate-800"
                        : ""
                    }`}
                  >
                    <div className="absolute left-0 top-1.5 size-4 rounded-full bg-slate-200 dark:bg-slate-700 border-2 border-white dark:border-slate-900" />
                    <p className="text-[11px] font-bold text-slate-900 dark:text-slate-200">
                      Sesión #{session.number}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      {session.date} • {session.type}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Patient Info */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <img
                  src={patient.image || "/placeholder.svg"}
                  alt={patient.name}
                  className="size-10 rounded-lg object-cover"
                />
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">
                    {patient.name}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    {patient.age} • {patient.gender}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </main>

      {/* Footer Actions */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-4 md:px-8 py-3 md:py-4 shrink-0 shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.05)]">
        <div className="max-w-4xl xl:max-w-none mx-auto flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 md:gap-4">
          <div className="flex items-center gap-2 md:gap-3">
            <Button variant="outline" className="flex-1 sm:flex-initial h-10 md:h-11 px-4 md:px-6 rounded-xl gap-2 bg-transparent text-sm">
              <Save className="size-4" />
              <span className="hidden sm:inline">Guardar Borrador</span>
              <span className="sm:hidden">Borrador</span>
            </Button>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            <Button variant="ghost" className="hidden sm:flex h-10 md:h-11 px-4 md:px-6 rounded-xl gap-2 text-primary text-sm">
              <CalendarCheck className="size-4" />
              <span className="hidden md:inline">Agendar Próxima</span>
              <span className="md:hidden">Agendar</span>
            </Button>
            <Button className="flex-1 sm:flex-initial h-10 md:h-11 px-4 md:px-8 rounded-xl gap-2 text-sm">
              <CheckCircle className="size-4" />
              <span className="hidden sm:inline">Finalizar y Guardar</span>
              <span className="sm:hidden">Finalizar</span>
            </Button>
          </div>
        </div>
      </footer>
    </div>
  )
}
