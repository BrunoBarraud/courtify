"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'

export function TestPushButton() {
  const [loading, setLoading] = useState(false)
  const [ok, setOk] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleClick = async () => {
    setLoading(true)
    setOk(false)
    setError(null)
    try {
      const res = await fetch('/api/push/test', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'No se pudo enviar el push de prueba')
      setOk(true)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button onClick={handleClick} disabled={loading} variant="outline">
        {loading ? 'Enviando…' : 'Enviar push de prueba'}
      </Button>
      {ok && <span className="text-sm text-green-600">Enviado</span>}
      {error && <span className="text-sm text-destructive">{error}</span>}
    </div>
  )
}
