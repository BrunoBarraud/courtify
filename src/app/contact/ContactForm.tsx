'use client'

import { FormEvent, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function ContactForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [ok, setOk] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setOk(null)
    setError(null)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error((data as { error?: string }).error || 'No se pudo enviar el mensaje')
      }
      setOk('Mensaje enviado. Te responderemos a la brevedad.')
      setName('')
      setEmail('')
      setSubject('')
      setMessage('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error inesperado')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Enviá tu consulta</CardTitle>
        <CardDescription>Completá el formulario y te contactamos</CardDescription>
      </CardHeader>
      <CardContent>
        {ok && <div className="mb-4 p-3 text-sm text-green-600 bg-green-50 rounded-md">{ok}</div>}
        {error && <div className="mb-4 p-3 text-sm text-destructive bg-destructive/10 rounded-md">{error}</div>}
        <form className="grid gap-4" onSubmit={onSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre</Label>
              <Input id="name" placeholder="Tu nombre" value={name} onChange={(e) => setName(e.target.value)} required disabled={loading} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="tucorreo@ejemplo.com" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={loading} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="subject">Asunto</Label>
            <Input id="subject" placeholder="Quiero una demo" value={subject} onChange={(e) => setSubject(e.target.value)} required disabled={loading} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">Mensaje</Label>
            <textarea
              id="message"
              className="min-h-[140px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Contanos cómo te podemos ayudar"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={loading}>
              {loading ? 'Enviando...' : 'Enviar'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
