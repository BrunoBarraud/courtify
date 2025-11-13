import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/client'

type ExistsMap = Record<'notifications' | 'notification_preferences', boolean>
type RealtimeHint = {
  message: string
  howToTest: {
    insert: {
      table: 'notifications'
      payload: Record<string, unknown>
    }
  }
}

// GET /api/dev/check-notifications
// Verifica existencia de tablas y hace una verificación heurística de Realtime
export async function GET(_req: NextRequest) {
  const supabase = createAdminClient()

  const result: { exists: ExistsMap; realtimeHint: RealtimeHint } = {
    exists: { notifications: false, notification_preferences: false },
    realtimeHint: {
      message: '',
      howToTest: { insert: { table: 'notifications', payload: {} } },
    },
  }

  try {
    // Chequear existencia de tablas consultando count limitado
    const tables = ['notifications', 'notification_preferences'] as const
    for (const t of tables) {
      const { error } = await supabase.from(t).select('id', { count: 'exact', head: true }).limit(1)
      result.exists[t] = !error
    }

    // Heurística de realtime: intentar abrir una suscripción temporal no es viable desde server.
    // En su lugar, devolvemos un hint para que el cliente pruebe una inserción de test.
    result.realtimeHint = {
      message: 'No se puede verificar Realtime desde el server. Probá insertar una notificación de test y observar si llega al cliente en vivo.',
      howToTest: {
        insert: {
          table: 'notifications',
          payload: {
            user_id: '<your_user_id>',
            notification_type: 'general',
            channel: 'email',
            title: 'Test realtime',
            body: 'Si ves un toast sin recargar, Realtime está ok',
            data: {},
            sent_at: new Date().toISOString(),
          },
        },
      },
    }

    return NextResponse.json({ ok: true, ...result })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Internal error'
    return NextResponse.json({ ok: false, error: message, ...result }, { status: 500 })
  }
}
