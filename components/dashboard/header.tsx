import { PlusCircle, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"

export function DashboardHeader() {
  return (
    <header className="max-w-[1200px] w-full mx-auto px-4 md:px-6 pt-6 md:pt-8 pb-4 md:pb-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-foreground tracking-tight text-balance">
            {"¡Hola, Dr. Ricardo S.!"}
          </h2>
          <p className="text-muted-foreground text-xs md:text-sm mt-1">
            Hoy tienes 6 citas programadas y 2 notas pendientes.
          </p>
        </div>
        <div className="flex gap-2 md:gap-3 w-full md:w-auto">
          <Button
            variant="outline"
            className="flex-1 md:flex-initial flex items-center justify-center gap-2 h-9 md:h-10 px-3 md:px-4 bg-transparent border-border text-muted-foreground font-semibold shadow-sm hover:bg-muted text-sm"
          >
            <PlusCircle className="size-4 text-primary" />
            <span className="hidden sm:inline">Nueva Sesión</span>
            <span className="sm:hidden">Sesión</span>
          </Button>
          <Button className="flex-1 md:flex-initial flex items-center justify-center gap-2 h-9 md:h-10 px-3 md:px-4 bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 text-sm">
            <Calendar className="size-4" />
            <span>Calendario</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
