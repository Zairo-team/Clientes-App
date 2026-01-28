import { Clock, Video, FileText, User } from "lucide-react"

const appointments = [
  {
    time: "09:00",
    duration: "60 min",
    name: "Juan Pérez",
    service: "Terapia Cognitivo-Conductual",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBDUmmKkj2_K7CQ4GbuqevmtIU2H42efZLzWFsEDXG0hs6XGsFIvAvBe0UqAJBI7jYyIc6G7acE6lknVeXeBSHpfqGX9DQ1FZ3i0osiASWjKiTer30De-puR1hKyVY1wcI5Cvko36Jzs0VwtsXf9wLdMGNgfSarWmm8tFjNRL2q24qEzVPrrCz1RllxEPTRlGgBqNeXHstuPA7gAfzdL2w6RPeK5rdnB5ELyo62gpgFpLYbruT9sQWZpdZaPd1xmoPykc7U3xdvEO8",
    hasVideo: true,
  },
  {
    time: "11:30",
    duration: "45 min",
    name: "María García",
    service: "Consulta Inicial",
    initials: "MG",
    initialsColor: "bg-purple-100 text-purple-700",
    hasVideo: false,
  },
  {
    time: "15:00",
    duration: "60 min",
    name: "Carlos Ruiz",
    service: "Seguimiento mensual",
    initials: "CR",
    initialsColor: "bg-orange-100 text-orange-700",
    hasVideo: true,
  },
]

export function AppointmentsList() {
  return (
    <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
      <div className="p-4 md:p-5 border-b border-border flex items-center justify-between">
        <h4 className="font-bold text-foreground flex items-center gap-2 text-sm md:text-base">
          <Clock className="size-4 md:size-5 text-primary" />
          <span className="hidden sm:inline">Próximas Citas (Hoy)</span>
          <span className="sm:hidden">Citas de Hoy</span>
        </h4>
        <a href="#" className="text-xs font-semibold text-primary hover:underline">
          Ver todas
        </a>
      </div>
      <div className="divide-y divide-border">
        {appointments.map((appointment) => (
          <div
            key={appointment.time}
            className="p-3 md:p-4 flex items-center justify-between hover:bg-muted/50 transition-colors gap-2"
          >
            <div className="flex items-center gap-2 md:gap-4 min-w-0 flex-1">
              <div className="flex flex-col items-center justify-center bg-muted rounded-lg px-2 md:px-3 py-1 text-center min-w-[56px] md:min-w-[70px] shrink-0">
                <span className="text-[11px] md:text-xs font-bold text-primary">{appointment.time}</span>
                <span className="text-[9px] md:text-[10px] text-muted-foreground font-medium">
                  {appointment.duration}
                </span>
              </div>
              <div className="flex items-center gap-2 md:gap-3 min-w-0">
                {appointment.avatar ? (
                  <div
                    className="size-8 md:size-9 rounded-full bg-muted bg-cover bg-center shrink-0"
                    style={{ backgroundImage: `url("${appointment.avatar}")` }}
                  />
                ) : (
                  <div
                    className={`size-8 md:size-9 rounded-full flex items-center justify-center font-bold text-[10px] md:text-xs shrink-0 ${appointment.initialsColor}`}
                  >
                    {appointment.initials}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-xs md:text-sm font-semibold text-foreground truncate">{appointment.name}</p>
                  <p className="text-[10px] md:text-xs text-muted-foreground truncate">{appointment.service}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 md:gap-2 shrink-0">
              <button className="size-7 md:size-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-muted transition-colors">
                {appointment.hasVideo ? (
                  <Video className="size-3.5 md:size-4" />
                ) : (
                  <User className="size-3.5 md:size-4" />
                )}
              </button>
              <button className="size-7 md:size-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-muted transition-colors">
                <FileText className="size-3.5 md:size-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
