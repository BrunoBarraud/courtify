"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { enablePushNotifications } from '@/lib/firebase/push'

export function HabilitarPushButton() {
  const [loading, setLoading] = useState(false)
  const [ok, setOk] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleClick = async () => {
    setLoading(true)
    setError(null)
    setOk(false)
    try {
      await enablePushNotifications()
      setOk(true)
    } catch (e: any) {
      setError(e.message || 'No se pudieron habilitar las notificaciones')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button onClick={handleClick} disabled={loading} variant="secondary">
        {loading ? 'Habilitando…' : 'Habilitar notificaciones'}
      </Button>
      {ok && <span className="text-sm text-green-600">Listo</span>}
      {error && <span className="text-sm text-destructive">{error}</span>}
    </div>
  )
}
