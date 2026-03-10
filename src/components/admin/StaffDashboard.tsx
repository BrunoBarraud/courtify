import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, AlertCircle } from 'lucide-react'
import { formatDateTimeAR, formatCurrencyARS } from '@/lib/i18n/format'

type StaffDashboardProps = {
  todayBookings: Record<string, any>[] // Temporal fallback until full types are resolved
}

export function StaffDashboard({ todayBookings }: StaffDashboardProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Agenda del Día</h1>
        <p className="text-muted-foreground">Control de Check-In y Cobros (Vista de Recepción)</p>
      </div>

      <Card>
         <CardHeader>
            <CardTitle>Turnos de Hoy</CardTitle>
            <CardDescription>Próximas reservas a llegar al complejo</CardDescription>
         </CardHeader>
         <CardContent>
            {todayBookings.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                No hay turnos agendados para lo que queda del día.
              </div>
            ) : (
              <div className="divide-y">
                {todayBookings.map((booking) => (
                   <div key={booking.id} className="py-4 flex justify-between items-center">
                     <div>
                       <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-lg">{formatDateTimeAR(booking.start_datetime)}</span>
                          <Badge variant="outline">{booking.court?.name}</Badge>
                       </div>
                       <div className="text-sm text-muted-foreground">Modo de pago pendiente</div>
                     </div>
                     <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="font-bold">{formatCurrencyARS(booking.final_amount)}</div>
                          {booking.status === 'confirmed' ? (
                            <span className="text-xs text-green-600 flex items-center justify-end gap-1"><CheckCircle2 className="h-3 w-3"/> Cobrado</span>
                          ) : (
                            <span className="text-xs text-amber-600 flex items-center justify-end gap-1"><AlertCircle className="h-3 w-3"/> A cobrar</span>
                          )}
                        </div>
                     </div>
                   </div>
                ))}
              </div>
            )}
         </CardContent>
      </Card>
    </div>
  )
}
