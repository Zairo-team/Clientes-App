import { TrendingUp } from "lucide-react"

const chartData = [
  { day: "Lun", height: 40, isToday: false, isPast: true },
  { day: "Mar", height: 65, isToday: false, isPast: true },
  { day: "Mie", height: 85, isToday: false, isPast: true },
  { day: "Hoy", height: 100, isToday: true, isPast: false },
  { day: "Vie", height: 30, isToday: false, isPast: false },
  { day: "Sab", height: 20, isToday: false, isPast: false },
]

export function BillingChart() {
  return (
    <div className="bg-card rounded-xl border border-border shadow-sm p-4 md:p-6">
      <div className="flex items-center justify-between mb-4 md:mb-6 gap-2">
        <h4 className="font-bold text-foreground flex items-center gap-2 text-sm md:text-base">
          <TrendingUp className="size-4 md:size-5 text-emerald-500" />
          <span className="hidden sm:inline">Tendencia de Facturación Semanal</span>
          <span className="sm:hidden">Facturación Semanal</span>
        </h4>
        <span className="text-[10px] md:text-xs text-muted-foreground font-medium shrink-0">Monto acumulado</span>
      </div>
      <div className="h-24 md:h-32 flex items-end gap-1.5 md:gap-2 px-1 md:px-2">
        {chartData.map((item) => (
          <div key={item.day} className="flex-1 relative group">
            <div
              className={`rounded-t-md transition-all ${
                item.isToday
                  ? "bg-primary"
                  : item.isPast
                  ? item.height > 70
                    ? "bg-primary/40"
                    : "bg-muted"
                  : "bg-muted"
              }`}
              style={{ height: `${item.height}%` }}
            />
            <div
              className={`absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold transition-opacity ${
                item.isToday
                  ? "text-primary opacity-100"
                  : "text-muted-foreground opacity-0 group-hover:opacity-100"
              }`}
            >
              {item.day}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
