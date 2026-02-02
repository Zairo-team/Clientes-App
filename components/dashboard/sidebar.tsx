"use client"

import { useState } from "react"
import {
  LayoutDashboard,
  Users,
  Calendar,
  Briefcase,
  BarChart3,
  Settings,
  LogOut,
  HeartPulse,
  Menu,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"

interface SidebarProps {
  currentPage?: string
}

export function Sidebar({ currentPage = "dashboard" }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { profile, signOut } = useAuth()
  const router = useRouter()

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/", page: "dashboard" },
    { icon: Users, label: "Pacientes", href: "/pacientes", page: "pacientes" },
    { icon: Calendar, label: "Calendario", href: "/calendario", page: "calendario" },
    { icon: Briefcase, label: "Servicios", href: "/servicios", page: "servicios" },
    { icon: BarChart3, label: "Reportes", href: "/reportes", page: "reportes" },
    { icon: Settings, label: "Configuración", href: "/configuracion", page: "configuracion" },
  ]

  const handleLogout = async () => {
    await signOut()
    router.push('/login')
  }

  const getInitials = (name: string) => {
    const names = name.split(' ')
    return names.length > 1
      ? `${names[0][0]}${names[1][0]}`.toUpperCase()
      : name.substring(0, 2).toUpperCase()
  }

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-card border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-primary size-9 rounded-lg flex items-center justify-center text-primary-foreground shadow-md">
            <HeartPulse className="size-4" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-foreground text-base font-bold leading-tight">Gestor Pro</h1>
            <p className="text-muted-foreground text-[10px] font-medium">
              {profile?.business_name || 'Software para Especialistas'}
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="size-10 rounded-lg flex items-center justify-center text-foreground hover:bg-muted transition-colors"
        >
          {isOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "w-64 border-r border-border bg-card flex flex-col h-full",
        "fixed lg:relative z-50 transition-transform duration-300 ease-in-out",
        "lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 flex flex-col h-full justify-between">
          <div className="flex flex-col gap-8">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="bg-primary size-10 rounded-lg flex items-center justify-center text-primary-foreground shadow-md">
                <HeartPulse className="size-5" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-foreground text-lg font-bold leading-tight">Gestor Pro</h1>
                <p className="text-muted-foreground text-xs font-medium">
                  {profile?.business_name || 'Software para Especialistas'}
                </p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex flex-col gap-1">
              {navItems.map((item) => {
                const isActive = currentPage === item.page
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted"
                    )}
                  >
                    <item.icon className={cn("size-5", isActive && "fill-primary/20")} />
                    <span className={cn("text-sm", isActive ? "font-semibold" : "font-medium")}>
                      {item.label}
                    </span>
                  </Link>
                )
              })}
            </nav>
          </div>

          {/* User Profile & Logout */}
          <div className="pt-6 border-t border-border flex flex-col gap-4">
            <div className="flex items-center gap-3 px-2">
              {profile?.avatar_url ? (
                <div
                  className="size-8 rounded-full bg-muted bg-cover bg-center"
                  style={{ backgroundImage: `url("${profile.avatar_url}")` }}
                />
              ) : (
                <div className="size-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                  {profile?.full_name ? getInitials(profile.full_name) : 'U'}
                </div>
              )}
              <div className="overflow-hidden">
                <p className="text-sm font-semibold text-foreground truncate">
                  {profile?.full_name || 'Usuario'}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {profile?.professional_title || 'Profesional'}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 rounded-lg h-10 px-4 bg-muted text-muted-foreground text-sm font-bold transition-all hover:bg-muted/80"
            >
              <LogOut className="size-4" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
