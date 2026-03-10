import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DollarSign, Activity, CalendarDays } from 'lucide-react'
import { formatCurrencyARS } from '@/lib/i18n/format'

type OwnerDashboardProps = {
  venuesCount: number | null
  courtsCount: number | null
  totalRevenue: number
  activeBookings: number
}

export function OwnerDashboard({ venuesCount, courtsCount, totalRevenue, activeBookings }: OwnerDashboardProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Finanzas y Rendimiento</h1>
        <p className="text-muted-foreground">Métricas generales de la sede (Vista de Dueño)</p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Facturación del Mes</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrencyARS(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">+20% vs mes pasado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sedes Activas</CardTitle>
            <Activity className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{venuesCount ?? 0}</div>
            <p className="text-xs text-muted-foreground">En toda la plataforma</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Canchas</CardTitle>
            <Activity className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{courtsCount ?? 0}</div>
            <p className="text-xs text-muted-foreground">Disponibles para reserva</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Turnos de Hoy</CardTitle>
            <CalendarDays className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeBookings ?? 0}</div>
            <p className="text-xs text-muted-foreground">Agendados para hoy</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Últimos Ingresos (Mercado Pago)</CardTitle>
            <CardDescription>Pagos confirmados recientemente por la plataforma</CardDescription>
          </CardHeader>
          <CardContent>
             <div className="text-sm text-muted-foreground">
                <p>Las métricas detalladas de pagos se muestran aquí.</p>
             </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ocupación por Cancha</CardTitle>
            <CardDescription>Desglose de reservas</CardDescription>
          </CardHeader>
          <CardContent>
             <div className="text-sm text-muted-foreground">
                <p>Próximamente: Gráfico de ocupación.</p>
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
