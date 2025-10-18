import { cookies } from 'next/headers'
import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCurrencyARS, formatDateTimeAR } from '@/lib/i18n/format'
import { redirect } from 'next/navigation'

export default async function MyBookingsPage() {
  const supabase = createServerClient(() => cookies())
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    redirect('/auth/signin')
  }

  const { data: bookings } = await supabase
    .from('bookings')
    .select(`
      *,
      court:courts(*, venue:venues(*))
    `)
    .eq('user_id', session.user.id)
    .order('start_datetime', { ascending: false })

  return (
    <div className="container py-10">
      <Card>
        <CardHeader>
          <CardTitle>Mis reservas</CardTitle>
          <CardDescription>Revisá el estado de tus reservas y realizá el pago.</CardDescription>
        </CardHeader>
        <CardContent>
          {!bookings || bookings.length === 0 ? (
            <div className="text-muted-foreground">No tenés reservas aún.</div>
          ) : (
            <div className="space-y-4">
              {bookings.map((b: any) => (
                <div key={b.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold truncate">{b.court?.name} • {b.court?.venue?.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {formatDateTimeAR(b.start_datetime)} — {formatDateTimeAR(b.end_datetime)}
                    </div>
                    <div className="text-sm mt-1">Estado: {b.status}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{formatCurrencyARS(b.final_amount)}</span>
                    <Link href={`/bookings/${b.id}`}>
                      <Button size="sm" variant="outline">Ver</Button>
                    </Link>
                    <Link href={`/payments/checkout?bookingId=${b.id}`}>
                      <Button size="sm" disabled={b.status === 'confirmed'}>Pagar Stripe</Button>
                    </Link>
                    <Link href={`/payments/start?bookingId=${b.id}&method=mercadopago`}>
                      <Button size="sm" variant="secondary" disabled={b.status === 'confirmed'}>Pagar MP</Button>
                    </Link>
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
