"use client"

import { useState, FormEvent } from "react"
import { useRouter } from "next/navigation"
import { Mail, Lock, LogIn, HeartPulse, UserPlus, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
  })

  const router = useRouter()
  const { signIn, signUp } = useAuth()
  const { toast } = useToast()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (isLogin) {
        await signIn(formData.email, formData.password)
        toast({
          title: "¡Bienvenido!",
          description: "Has iniciado sesión correctamente.",
        })
        router.push("/")
      } else {
        if (!formData.fullName.trim()) {
          toast({
            title: "Error",
            description: "Por favor ingresa tu nombre completo.",
            variant: "destructive",
          })
          setLoading(false)
          return
        }
        await signUp(formData.email, formData.password, formData.fullName)
        toast({
          title: "¡Cuenta creada!",
          description: "Por favor verifica tu correo electrónico para activar tu cuenta.",
        })
        setIsLogin(true)
        setFormData({ email: "", password: "", fullName: "" })
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Ocurrió un error. Intenta nuevamente.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen overflow-hidden">
      {/* Left Side - Image */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <Image
          src="https://images.unsplash.com/photo-1497366754035-f200968a6e72?q=80&w=2069&auto=format&fit=crop"
          alt="Professional Office"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-primary/10 mix-blend-multiply" />
        <div className="absolute bottom-12 left-12 right-12 text-white z-10">
          <h2 className="text-4xl font-bold leading-tight mb-4 text-balance">
            Administra tu práctica con calma y profesionalismo.
          </h2>
          <p className="text-lg text-white/90">
            La herramienta diseñada para especialistas de la salud que valoran
            su tiempo y el de sus pacientes.
          </p>
        </div>
      </div>

      {/* Right Side - Login/Register Form */}
      <main className="w-full lg:w-1/2 flex flex-col justify-center items-center px-4 py-8 md:px-12 lg:px-24 bg-card min-h-screen">
        <div className="w-full max-w-md">
          {/* Logo and Brand */}
          <div className="flex items-center gap-3 mb-8 md:mb-12 justify-center lg:justify-start">
            <div className="bg-primary size-9 md:size-10 rounded-lg flex items-center justify-center text-white shadow-md">
              <HeartPulse className="size-4 md:size-5" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-foreground text-lg md:text-xl font-bold leading-tight">
                Gestor Pro
              </h1>
              <p className="text-muted-foreground text-[10px] md:text-xs font-medium">
                Software para Especialistas
              </p>
            </div>
          </div>

          {/* Header */}
          <div className="mb-6 md:mb-10 text-center lg:text-left">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2 tracking-tight">
              {isLogin ? "Acceso Profesional" : "Crear Cuenta"}
            </h2>
            <p className="text-muted-foreground text-sm md:text-base">
              {isLogin
                ? "Ingresa tus credenciales para gestionar tu consulta."
                : "Regístrate para comenzar a usar Gestor Pro."}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
            {/* Full Name Field (only for register) */}
            {!isLogin && (
              <div>
                <Label
                  htmlFor="fullName"
                  className="block text-xs md:text-sm font-semibold mb-2"
                >
                  Nombre completo
                </Label>
                <div className="relative">
                  <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-4" />
                  <Input
                    id="fullName"
                    name="fullName"
                    type="text"
                    placeholder="Dr. Juan Pérez"
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                    className="pl-10 h-11 md:h-12 bg-muted/50 rounded-xl text-sm"
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            {/* Email Field */}
            <div>
              <Label
                htmlFor="email"
                className="block text-xs md:text-sm font-semibold mb-2"
              >
                Correo electrónico
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-4" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="ejemplo@doctor.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="pl-10 h-11 md:h-12 bg-muted/50 rounded-xl text-sm"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <Label
                  htmlFor="password"
                  className="block text-xs md:text-sm font-semibold"
                >
                  Contraseña
                </Label>
                {isLogin && (
                  <a
                    href="#"
                    className="text-[10px] md:text-xs font-semibold text-primary hover:underline"
                  >
                    ¿Olvidaste tu contraseña?
                  </a>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-4" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="pl-10 h-11 md:h-12 bg-muted/50 rounded-xl text-sm"
                  required
                  minLength={6}
                />
              </div>
              {!isLogin && (
                <p className="text-[10px] md:text-xs text-muted-foreground mt-1">
                  Mínimo 6 caracteres
                </p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 md:h-12 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 text-sm md:text-base"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  {isLogin ? "Iniciando sesión..." : "Creando cuenta..."}
                </>
              ) : (
                <>
                  <span>{isLogin ? "Iniciar Sesión" : "Crear Cuenta"}</span>
                  <LogIn className="ml-2 size-4" />
                </>
              )}
            </Button>
          </form>

          {/* Toggle Login/Register */}
          <div className="mt-6 md:mt-10 pt-6 md:pt-8 border-t text-center">
            <p className="text-xs md:text-sm text-muted-foreground">
              {isLogin ? "¿No tienes una cuenta?" : "¿Ya tienes una cuenta?"}{" "}
              <button
                onClick={() => {
                  setIsLogin(!isLogin)
                  setFormData({ email: "", password: "", fullName: "" })
                }}
                className="font-bold text-primary hover:underline"
              >
                {isLogin ? "Regístrate" : "Inicia sesión"}
              </button>
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
