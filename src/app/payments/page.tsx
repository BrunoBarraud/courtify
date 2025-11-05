import { cookies } from 'next/headers'
import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export const dynamic = 'force-dynamic'

interface PaymentsPageProps {
  searchParams?: { [key: string]: string | string[] | undefined }
}

export default async function PaymentsPage({ searchParams }: PaymentsPageProps) {
  const pageParam = typeof searchParams?.page === 'string' ? parseInt(searchParams!.page, 10) : 1
  const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1
  const pageSize = 10
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  const supabase = createServerClient(() => cookies())

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return (
      <div className="container py-10 max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle>Pagos</CardTitle>
            <CardDescription>Iniciá sesión para ver tu historial de pagos.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/auth/signin">
              <Button>Ingresar</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const { data: payments, count } = await supabase
    .from('payments')
    .select('*', { count: 'exact' })
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false })
    .range(from, to)

  const total = count || 0
  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  return (
    <div className="container py-10 max-w-5xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Pagos</h1>
        <p className="text-muted-foreground">Historial y acciones relacionadas a tus pagos.</p>
      </div>

      <section>
        <Card>
          <CardHeader>
            <CardTitle>Historial</CardTitle>
            <CardDescription>Últimos pagos realizados</CardDescription>
          </CardHeader>
          <CardContent>
            {!payments || payments.length === 0 ? (
              <div className="text-sm text-muted-foreground">No tenés pagos registrados todavía.</div>
            ) : (
              <ul className="divide-y">
                {payments.map((p: { id: string; payment_method?: string; created_at: string; currency: string; amount: number; payment_status?: string }) => (
                  <li key={p.id} className="py-3 flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="font-medium">{p.payment_method?.toUpperCase() || 'Pago'}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(p.created_at).toLocaleString()} · {p.currency} {p.amount}
                      </div>
                    </div>
                    <div className="text-xs">
                      <span className="inline-flex items-center rounded-full px-2 py-0.5 border text-muted-foreground">
                        {String(p.payment_status || 'pending')}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-4">
                <span className="text-sm text-muted-foreground">
                  Página {page} de {totalPages}
                </span>
                <div className="space-x-2">
                  <Button asChild variant="outline" disabled={page <= 1}>
                    <Link href={`/payments?page=${page - 1}`}>Anterior</Link>
                  </Button>
                  <Button asChild variant="outline" disabled={page >= totalPages}>
                    <Link href={`/payments?page=${page + 1}`}>Siguiente</Link>
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      <section>
        <Card>
          <CardHeader>
            <CardTitle>Acciones de pago</CardTitle>
            <CardDescription>Próximamente: reintentar pago, descargar comprobante, solicitar reintegro, etc.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">Placeholder de acciones.</div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
