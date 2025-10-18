import { cookies } from 'next/headers'
import { createServerClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default async function AdminHomePage() {
  const supabase = createServerClient(() => cookies())
  const { data: { session } } = await supabase.auth.getSession()
  const userId = session?.user?.id

  const [{ count: venuesCount }, { count: courtsCount }] = await Promise.all([
    supabase.from('venues').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('courts').select('*', { count: 'exact', head: true }),
  ])

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Panel de administración</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Sedes activas</CardTitle>
            <CardDescription>Total de sedes visibles</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{venuesCount ?? 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Canchas</CardTitle>
            <CardDescription>Total de canchas registradas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{courtsCount ?? 0}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
