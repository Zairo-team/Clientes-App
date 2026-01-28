import { CreditCard, CalendarDays, Clock } from "lucide-react"

const stats = [
  {
    icon: CreditCard,
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
    label: "Facturación del Mes",
    value: "€4,250.00",
    badge: "+12% vs mes ant.",
    badgeColor: "text-emerald-500 bg-emerald-50",
  },
  {
    icon: CalendarDays,
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
    label: "Facturación del Día",
    value: "€320.00",
    badge: "6 sesiones hoy",
    badgeColor: "text-muted-foreground bg-transparent",
  },
  {
    icon: Clock,
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
    label: "Pagos Pendientes",
    value: "€450.00",
    badge: "3 Pendientes",
    badgeColor: "text-amber-600 bg-amber-50",
  },
]

export function StatsCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-card p-4 md:p-6 rounded-xl border border-border shadow-sm"
        >
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <div
              className={`size-9 md:size-10 rounded-lg ${stat.iconBg} ${stat.iconColor} flex items-center justify-center`}
            >
              <stat.icon className="size-4 md:size-5" />
            </div>
            <span
              className={`text-[10px] md:text-xs font-bold ${stat.badgeColor} px-2 py-0.5 rounded-full`}
            >
              {stat.badge}
            </span>
          </div>
          <p className="text-muted-foreground text-xs md:text-sm font-medium">{stat.label}</p>
          <h3 className="text-xl md:text-2xl font-bold text-foreground">{stat.value}</h3>
        </div>
      ))}
    </div>
  )
}
