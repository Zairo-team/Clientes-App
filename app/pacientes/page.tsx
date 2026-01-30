'use client'

import { useEffect, useState } from 'react'
import { Sidebar } from '@/components/dashboard/sidebar'
import { Button } from '@/components/ui/button'
import { Plus, Search, Eye, Mail, MessageCircle, Loader2, Filter, ArrowUpDown, ArrowUp, ArrowDown, MoreVertical, Edit, Trash2, X, Calendar } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { CreatePatientModal } from '@/components/patients/create-patient-modal'
import { EditPatientModal } from '@/components/patients/edit-patient-modal'
import ProtectedRoute from '@/components/protected-route'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { getPatients, searchPatients } from '@/lib/api/patients'
import type { Patient } from '@/lib/supabase/client'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export default function PacientesPage() {
  const { profile } = useAuth()
  const router = useRouter()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    hasEmail: false,
    hasPhone: false,
    ageMin: '',
    ageMax: '',
    dateFrom: '',
    dateTo: ''
  })
  const [sortBy, setSortBy] = useState<'name-asc' | 'name-desc' | 'date-asc' | 'date-desc' | 'dni-asc' | 'dni-desc' | 'age-asc' | 'age-desc'>('date-desc')
  const [showSortMenu, setShowSortMenu] = useState(false)

  useEffect(() => {
    if (profile?.id) {
      loadPatients()
    }
  }, [profile?.id]) // Only re-run when profile ID actually changes

  const loadPatients = async () => {
    if (!profile?.id) return

    try {
      setLoading(true)
      const data = await getPatients(profile.id)
      setPatients(data)
    } catch (error) {
      console.error('Error loading patients:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async (query: string) => {
    setSearchQuery(query)
    if (!profile?.id) return

    if (!query.trim()) {
      loadPatients()
      return
    }

    try {
      const data = await searchPatients(profile.id, query)
      setPatients(data)
    } catch (error) {
      console.error('Error searching patients:', error)
    }
  }

  const applyFilters = () => {
    if (!profile?.id) return

    loadPatients().then(() => {
      // Apply filters in frontend
      setPatients(prevPatients => {
        let filtered = [...prevPatients]

        // Filter by email
        if (filters.hasEmail) {
          filtered = filtered.filter(p => p.email && p.email.trim() !== '')
        }

        // Filter by phone
        if (filters.hasPhone) {
          filtered = filtered.filter(p => p.phone && p.phone.trim() !== '')
        }

        // Filter by age
        if (filters.ageMin || filters.ageMax) {
          filtered = filtered.filter(p => {
            if (!p.date_of_birth) return false
            const age = Math.floor((Date.now() - new Date(p.date_of_birth).getTime()) / (1000 * 60 * 60 * 24 * 365.25))
            const min = filters.ageMin ? parseInt(filters.ageMin) : 0
            const max = filters.ageMax ? parseInt(filters.ageMax) : 999
            return age >= min && age <= max
          })
        }

        // Filter by registration date
        if (filters.dateFrom) {
          filtered = filtered.filter(p => new Date(p.created_at) >= new Date(filters.dateFrom))
        }
        if (filters.dateTo) {
          filtered = filtered.filter(p => new Date(p.created_at) <= new Date(filters.dateTo))
        }

        return filtered
      })
    })
  }

  const clearFilters = () => {
    setFilters({
      hasEmail: false,
      hasPhone: false,
      ageMin: '',
      ageMax: '',
      dateFrom: '',
      dateTo: ''
    })
    setShowFilters(false)
    loadPatients()
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (filters.hasEmail) count++
    if (filters.hasPhone) count++
    if (filters.ageMin || filters.ageMax) count++
    if (filters.dateFrom || filters.dateTo) count++
    return count
  }

  const sortPatients = (patientsToSort: Patient[]) => {
    const sorted = [...patientsToSort]
    switch (sortBy) {
      case 'name-asc': return sorted.sort((a, b) => a.full_name.localeCompare(b.full_name))
      case 'name-desc': return sorted.sort((a, b) => b.full_name.localeCompare(a.full_name))
      case 'date-asc': return sorted.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      case 'date-desc': return sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      case 'dni-asc': return sorted.sort((a, b) => (a.dni || '').localeCompare(b.dni || ''))
      case 'dni-desc': return sorted.sort((a, b) => (b.dni || '').localeCompare(a.dni || ''))
      case 'age-asc': return sorted.sort((a, b) => {
        const ageA = a.date_of_birth ? Math.floor((Date.now() - new Date(a.date_of_birth).getTime()) / (1000 * 60 * 60 * 24 * 365.25)) : 999
        const ageB = b.date_of_birth ? Math.floor((Date.now() - new Date(b.date_of_birth).getTime()) / (1000 * 60 * 60 * 24 * 365.25)) : 999
        return ageA - ageB
      })
      case 'age-desc': return sorted.sort((a, b) => {
        const ageA = a.date_of_birth ? Math.floor((Date.now() - new Date(a.date_of_birth).getTime()) / (1000 * 60 * 60 * 24 * 365.25)) : -1
        const ageB = b.date_of_birth ? Math.floor((Date.now() - new Date(b.date_of_birth).getTime()) / (1000 * 60 * 60 * 24 * 365.25)) : -1
        return ageB - ageA
      })
      default: return sorted
    }
  }

  const handleSort = (newSortBy: typeof sortBy) => {
    setSortBy(newSortBy)
    setShowSortMenu(false)
    setPatients(prevPatients => sortPatients(prevPatients))
  }

  const getSortLabel = () => {
    switch (sortBy) {
      case 'name-asc': return 'Nombre A-Z'
      case 'name-desc': return 'Nombre Z-A'
      case 'date-asc': return 'Más antiguos'
      case 'date-desc': return 'Más recientes'
      case 'dni-asc': return 'DNI ascendente'
      case 'dni-desc': return 'DNI descendente'
      case 'age-asc': return 'Menor edad'
      case 'age-desc': return 'Mayor edad'
    }
  }

  const removeFilter = (filterKey: string) => {
    const newFilters = { ...filters }
    if (filterKey === 'email') newFilters.hasEmail = false
    if (filterKey === 'phone') newFilters.hasPhone = false
    if (filterKey === 'age') {
      newFilters.ageMin = ''
      newFilters.ageMax = ''
    }
    if (filterKey === 'date') {
      newFilters.dateFrom = ''
      newFilters.dateTo = ''
    }
    setFilters(newFilters)

    // Re-apply filters with the new filter state
    if (!profile?.id) return

    loadPatients().then(() => {
      // Apply the NEW filters (not the old state)
      setPatients(prevPatients => {
        let filtered = [...prevPatients]

        // Filter by email
        if (newFilters.hasEmail) {
          filtered = filtered.filter(p => p.email && p.email.trim() !== '')
        }

        // Filter by phone
        if (newFilters.hasPhone) {
          filtered = filtered.filter(p => p.phone && p.phone.trim() !== '')
        }

        // Filter by age
        if (newFilters.ageMin || newFilters.ageMax) {
          filtered = filtered.filter(p => {
            if (!p.date_of_birth) return false
            const age = Math.floor((Date.now() - new Date(p.date_of_birth).getTime()) / (1000 * 60 * 60 * 24 * 365.25))
            const min = newFilters.ageMin ? parseInt(newFilters.ageMin) : 0
            const max = newFilters.ageMax ? parseInt(newFilters.ageMax) : 999
            return age >= min && age <= max
          })
        }

        // Filter by registration date
        if (newFilters.dateFrom) {
          filtered = filtered.filter(p => new Date(p.created_at) >= new Date(newFilters.dateFrom))
        }
        if (newFilters.dateTo) {
          filtered = filtered.filter(p => new Date(p.created_at) <= new Date(newFilters.dateTo))
        }

        return filtered
      })
    })
  }

  const getInitials = (name: string) => {
    const names = name.split(' ')
    return names.length > 1
      ? `${names[0][0]}${names[1][0]}`.toUpperCase()
      : name.substring(0, 2).toUpperCase()
  }

  const getColorClass = (index: number) => {
    const colors = [
      'bg-blue-100 text-blue-700',
      'bg-purple-100 text-purple-700',
      'bg-orange-100 text-orange-700',
      'bg-cyan-100 text-cyan-700',
      'bg-rose-100 text-rose-700',
      'bg-emerald-100 text-emerald-700',
    ]
    return colors[index % colors.length]
  }

  const getTimeAgo = (date: string) => {
    if (!date) return 'Nunca'
    const days = Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24))
    if (days === 0) return 'Hoy'
    if (days === 1) return 'Ayer'
    if (days < 7) return `Hace ${days} días`
    if (days < 30) return `Hace ${Math.floor(days / 7)} semanas`
    return `Hace ${Math.floor(days / 30)} meses`
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="flex h-screen overflow-hidden bg-background">
        <Sidebar currentPage="pacientes" />

        <main className="flex-1 flex flex-col overflow-y-auto pt-16 lg:pt-0">
          <div className="max-w-[1200px] w-full mx-auto px-4 md:px-6 pt-6 md:pt-8 pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl md:text-3xl font-black text-foreground tracking-tight">{"Pacientes"}</h2>
                <p className="text-muted-foreground text-xs md:text-sm mt-1">
                  {"Gestiona tu base de datos de pacientes y su historial."}
                </p>
              </div>
              <Button
                onClick={() => setIsCreateModalOpen(true)}
                className="flex items-center gap-2 h-10 md:h-11 font-bold shadow-lg text-sm"
              >
                <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m3-3H9" />
                </svg>
                <span className="hidden sm:inline">{"Nuevo Paciente"}</span>
                <span className="sm:hidden">{"Nuevo"}</span>
              </Button>
            </div>
          </div>

          <div className="max-w-[1200px] w-full mx-auto px-4 md:px-6 py-3 md:py-4">
            <div className="bg-card p-2 rounded-xl border shadow-sm flex flex-col md:flex-row gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-muted-foreground" />
                <Input
                  className="pl-9 md:pl-11 h-10 md:h-11 bg-muted border-none text-sm"
                  placeholder="Buscar por nombre, DNI o email..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 md:flex-initial flex items-center justify-center gap-2 bg-transparent h-10 md:h-11 text-sm relative"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="w-4 h-4" />
                  <span className="hidden sm:inline">{"Filtros"}</span>
                  {getActiveFiltersCount() > 0 && (
                    <span className="absolute -top-1 -right-1 size-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                      {getActiveFiltersCount()}
                    </span>
                  )}
                </Button>
                <DropdownMenu open={showSortMenu} onOpenChange={setShowSortMenu}>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="flex-1 md:flex-initial flex items-center justify-center gap-2 bg-transparent h-10 md:h-11 text-sm">
                      <ArrowUpDown className="w-4 h-4" />
                      <span className="hidden sm:inline">{getSortLabel()}</span>
                      <span className="sm:hidden">Ordenar</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">Ordenar por</div>
                    <DropdownMenuItem onClick={() => handleSort('name-asc')} className="cursor-pointer">
                      <ArrowUp className="w-4 h-4 mr-2" />Nombre A-Z
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleSort('name-desc')} className="cursor-pointer">
                      <ArrowDown className="w-4 h-4 mr-2" />Nombre Z-A
                    </DropdownMenuItem>
                    <div className="h-px bg-border my-1" />
                    <DropdownMenuItem onClick={() => handleSort('date-desc')} className="cursor-pointer">
                      <Calendar className="w-4 h-4 mr-2" />Más recientes
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleSort('date-asc')} className="cursor-pointer">
                      <Calendar className="w-4 h-4 mr-2" />Más antiguos
                    </DropdownMenuItem>
                    <div className="h-px bg-border my-1" />
                    <DropdownMenuItem onClick={() => handleSort('dni-asc')} className="cursor-pointer">
                      <ArrowUp className="w-4 h-4 mr-2" />DNI Ascendente
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleSort('dni-desc')} className="cursor-pointer">
                      <ArrowDown className="w-4 h-4 mr-2" />DNI Descendente
                    </DropdownMenuItem>
                    <div className="h-px bg-border my-1" />
                    <DropdownMenuItem onClick={() => handleSort('age-asc')} className="cursor-pointer">
                      <ArrowUp className="w-4 h-4 mr-2" />Menor edad
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleSort('age-desc')} className="cursor-pointer">
                      <ArrowDown className="w-4 h-4 mr-2" />Mayor edad
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Filter Chips */}
            {getActiveFiltersCount() > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {filters.hasEmail && (
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                    <span>Tiene email</span>
                    <button onClick={() => removeFilter('email')} className="hover:bg-primary/20 rounded-full p-0.5">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
                {filters.hasPhone && (
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                    <span>Tiene teléfono</span>
                    <button onClick={() => removeFilter('phone')} className="hover:bg-primary/20 rounded-full p-0.5">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
                {(filters.ageMin || filters.ageMax) && (
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                    <span>
                      Edad: {filters.ageMin || '0'}-{filters.ageMax || '∞'}
                    </span>
                    <button onClick={() => removeFilter('age')} className="hover:bg-primary/20 rounded-full p-0.5">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
                {(filters.dateFrom || filters.dateTo) && (
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                    <span>Registro: {filters.dateFrom || '...'} - {filters.dateTo || '...'}</span>
                    <button onClick={() => removeFilter('date')} className="hover:bg-primary/20 rounded-full p-0.5">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Filter Panel */}
            {showFilters && (
              <div className="mt-2 p-4 bg-muted/50 rounded-xl border animate-in slide-in-from-top-2 duration-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Age Filter */}
                  <div>
                    <label className="text-xs font-semibold text-foreground mb-2 block">Edad</label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder="Min"
                        value={filters.ageMin}
                        onChange={(e) => setFilters({ ...filters, ageMin: e.target.value })}
                        className="h-9 text-sm"
                      />
                      <Input
                        type="number"
                        placeholder="Max"
                        value={filters.ageMax}
                        onChange={(e) => setFilters({ ...filters, ageMax: e.target.value })}
                        className="h-9 text-sm"
                      />
                    </div>
                  </div>

                  {/* Contact Filter */}
                  <div>
                    <label className="text-xs font-semibold text-foreground mb-2 block">Contacto</label>
                    <div className="flex flex-col gap-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.hasEmail}
                          onChange={(e) => setFilters({ ...filters, hasEmail: e.target.checked })}
                          className="w-4 h-4 rounded border-input"
                        />
                        <span className="text-sm text-foreground">Tiene email</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.hasPhone}
                          onChange={(e) => setFilters({ ...filters, hasPhone: e.target.checked })}
                          className="w-4 h-4 rounded border-input"
                        />
                        <span className="text-sm text-foreground">Tiene teléfono</span>
                      </label>
                    </div>
                  </div>

                  {/* Date Range Filter */}
                  <div className="md:col-span-2">
                    <label className="text-xs font-semibold text-foreground mb-2 block">Fecha de registro</label>
                    <div className="flex gap-2">
                      <Input
                        type="date"
                        value={filters.dateFrom}
                        onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                        className="h-9 text-sm"
                      />
                      <span className="flex items-center text-muted-foreground">-</span>
                      <Input
                        type="date"
                        value={filters.dateTo}
                        onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                        className="h-9 text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Filter Actions */}
                <div className="flex gap-2 mt-4 pt-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearFilters}
                    className="flex-1"
                  >
                    Limpiar
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      applyFilters()
                      setShowFilters(false)
                    }}
                    className="flex-1"
                  >
                    Aplicar Filtros
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="max-w-[1200px] w-full mx-auto px-4 md:px-6 pb-8 md:pb-12">
            <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
              {patients.length === 0 ? (
                <div className="p-12 text-center">
                  <p className="text-muted-foreground text-sm mb-4">
                    {searchQuery ? 'No se encontraron pacientes' : 'Aún no tienes pacientes registrados'}
                  </p>
                  {!searchQuery && (
                    <Button onClick={() => setIsCreateModalOpen(true)} variant="outline">
                      Crear primer paciente
                    </Button>
                  )}
                </div>
              ) : (
                <>
                  {/* Mobile Card View */}
                  <div className="md:hidden divide-y divide-border">
                    {patients.map((patient, index) => (
                      <div key={patient.id} className="p-4 hover:bg-muted/30 transition-colors">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className={`size-10 rounded-full ${getColorClass(index)} flex items-center justify-center font-bold text-xs shrink-0`}>
                              {getInitials(patient.full_name)}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-foreground truncate">{patient.full_name}</p>
                              <p className="text-xs text-muted-foreground truncate">DNI: {patient.dni}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {patient.phone && (
                              <a
                                href={`https://wa.me/${patient.phone.replace(/\D/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="size-8 rounded-lg bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:hover:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center transition-colors"
                              >
                                <MessageCircle className="w-4 h-4" />
                              </a>
                            )}
                            {patient.email && (
                              <a
                                href={`mailto:${patient.email}`}
                                className="size-8 rounded-lg bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center transition-colors"
                              >
                                <Mail className="w-4 h-4" />
                              </a>
                            )}
                            <button
                              onClick={() => router.push(`/pacientes/${patient.id}`)}
                              className="size-8 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary flex items-center justify-center transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground pl-[52px]">
                          <span>{patient.email || 'Sin email'}</span>
                          <span>•</span>
                          <span>{patient.phone || 'Sin teléfono'}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Desktop Table View */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-muted/50 border-b">
                          <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            {"Nombre"}
                          </th>
                          <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            {"DNI"}
                          </th>
                          <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            {"Última Sesión"}
                          </th>
                          <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            {"Contacto"}
                          </th>
                          <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground text-center">
                            {"Acciones"}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {patients.map((patient, index) => (
                          <tr key={patient.id} className="hover:bg-muted/30 transition-colors group">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className={`size-9 rounded-full ${getColorClass(index)} flex items-center justify-center font-bold text-xs`}>
                                  {getInitials(patient.full_name)}
                                </div>
                                <span className="text-sm font-semibold text-foreground">{patient.full_name}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm text-foreground font-medium">{patient.dni}</span>
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-sm text-muted-foreground">
                                {patient.last_session_date
                                  ? new Date(patient.last_session_date).toLocaleDateString('es-AR')
                                  : 'Sin sesiones'}
                              </p>
                              <p className="text-[10px] text-muted-foreground/60">{getTimeAgo(patient.last_session_date || '')}</p>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-col">
                                <span className="text-sm text-muted-foreground">{patient.email || 'Sin email'}</span>
                                <span className="text-xs text-muted-foreground/60">{patient.phone || 'Sin teléfono'}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center justify-center gap-2">
                                {patient.phone && (
                                  <a
                                    href={`https://wa.me/${patient.phone.replace(/\D/g, '')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="size-9 rounded-lg bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:hover:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center transition-colors"
                                    title="Enviar WhatsApp"
                                  >
                                    <MessageCircle className="w-4 h-4" />
                                  </a>
                                )}
                                {patient.email && (
                                  <a
                                    href={`mailto:${patient.email}`}
                                    className="size-9 rounded-lg bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center transition-colors"
                                    title="Enviar email"
                                  >
                                    <Mail className="w-4 h-4" />
                                  </a>
                                )}
                                <button
                                  onClick={() => router.push(`/pacientes/${patient.id}`)}
                                  className="size-9 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary flex items-center justify-center transition-colors"
                                  title="Ver detalle"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 md:px-6 py-3 md:py-4 bg-muted/50 border-t">
                    <p className="text-xs md:text-sm text-muted-foreground">
                      {"Mostrando "}
                      <span className="font-medium text-foreground">{patients.length}</span>
                      {" pacientes"}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </main>

        <CreatePatientModal
          open={isCreateModalOpen}
          onOpenChange={setIsCreateModalOpen}
          onPatientCreated={loadPatients}
        />

        <EditPatientModal
          open={isEditModalOpen}
          onOpenChange={setIsEditModalOpen}
          patient={selectedPatient}
          onPatientUpdated={loadPatients}
        />
      </div >
    </ProtectedRoute >
  )
}
