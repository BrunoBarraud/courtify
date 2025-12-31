'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import PermissionGate, { ActionButton } from '@/components/auth/PermissionGate'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

interface Court {
  id: string
  name: string
  court_type: string
  hourly_rate: number
  venue_id: string
}

export default function CourtsPage({ params }: { params: { id: string } }) {
  const [courts, setCourts] = useState<Court[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const loadCourts = async () => {
      const { data } = await supabase
        .from('courts')
        .select('*')
        .eq('venue_id', params.id)
        .order('name')

      setCourts(data || [])
      setLoading(false)
    }

    loadCourts()
  }, [supabase, params.id])

  return (
    <div className="container py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Canchas</h1>

        <PermissionGate venueId={params.id} permission="can_manage_courts">
          <Button>Agregar Cancha</Button>
        </PermissionGate>
      </div>

      {loading ? (
        <div>Cargando...</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {courts.map(court => (
            <Card key={court.id}>
              <CardHeader>
                <CardTitle>{court.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p>Tipo: {court.court_type}</p>
                  <p>Precio por hora: ${court.hourly_rate}</p>

                  <div className="flex gap-2">
                    <ActionButton
                      venueId={params.id}
                      permission="can_manage_courts"
                      className="bg-blue-500 text-white px-3 py-1 rounded"
                    >
                      Editar
                    </ActionButton>

                    <ActionButton
                      venueId={params.id}
                      permission="can_manage_courts"
                      className="bg-red-500 text-white px-3 py-1 rounded"
                    >
                      Eliminar
                    </ActionButton>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
