import { Zap, UserPlus, FileEdit, CalendarClock, CreditCard } from "lucide-react"

const activities = [
  {
    icon: UserPlus,
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
    title: "Nuevo paciente registrado",
    description: "Ana Belén se ha unido a la clínica.",
    time: "Hace 15 min",
  },
  {
    icon: FileEdit,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    title: "Notas de sesión completadas",
    description: "Sesión de Juan Pérez (09:00).",
    time: "Hace 2 horas",
  },
  {
    icon: CalendarClock,
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
    title: "Cita reprogramada",
    description: "Luis Gómez movió su cita al viernes.",
    time: "Ayer, 18:30",
  },
  {
    icon: CreditCard,
    iconBg: "bg-muted",
    iconColor: "text-muted-foreground",
    title: "Pago recibido",
    description: "M. García ha pagado la sesión #42.",
    time: "Ayer, 16:15",
  },
]

export function ActivityFeed() {
  return (
    <div className="bg-card rounded-xl border border-border shadow-sm h-full flex flex-col">
      <div className="p-4 md:p-5 border-b border-border">
        <h4 className="font-bold text-foreground flex items-center gap-2 text-sm md:text-base">
          <Zap className="size-4 md:size-5 text-muted-foreground" />
          Actividad Reciente
        </h4>
      </div>
      <div className="p-4 md:p-5 flex-1 space-y-5 md:space-y-6 overflow-y-auto">
        {activities.map((activity, index) => (
          <div
            key={activity.title}
            className="flex gap-2.5 md:gap-3 relative"
          >
            {/* Timeline line */}
            {index < activities.length - 1 && (
              <div className="absolute left-[14px] md:left-[17px] top-8 md:top-10 bottom-[-16px] md:bottom-[-20px] w-px bg-border" />
            )}
            <div
              className={`size-7 md:size-[34px] rounded-full ${activity.iconBg} ${activity.iconColor} flex items-center justify-center shrink-0 z-10`}
            >
              <activity.icon className="size-3.5 md:size-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs md:text-sm text-foreground font-medium">{activity.title}</p>
              <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5 truncate">{activity.description}</p>
              <span className="text-[9px] md:text-[10px] text-muted-foreground font-medium">
                {activity.time}
              </span>
            </div>
          </div>
        ))}
      </div>
      <div className="p-3 md:p-4 bg-muted/30 border-t border-border rounded-b-xl">
        <button className="w-full text-center text-[11px] md:text-xs font-bold text-muted-foreground hover:text-primary transition-colors">
          Ver todo el historial
        </button>
      </div>
    </div>
  )
}
