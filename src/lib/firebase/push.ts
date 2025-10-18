'use client'

import { initFirebase, getMessagingIfSupported } from './client'

export async function enablePushNotifications() {
  try {
    initFirebase()
    const messaging = await getMessagingIfSupported()
    if (!messaging) throw new Error('FCM no soportado en este navegador')

    const permission = await Notification.requestPermission()
    if (permission !== 'granted') throw new Error('Permiso de notificaciones denegado')

    const vapidKey = process.env.NEXT_PUBLIC_FCM_VAPID_KEY
    if (!vapidKey) throw new Error('Falta NEXT_PUBLIC_FCM_VAPID_KEY')

    // Ensure our SW is registered and ACTIVE before requesting token
    if (!('serviceWorker' in navigator)) throw new Error('Service Workers no soportados')
    // Reuse existing registration if available
    let registration = await navigator.serviceWorker.getRegistration()
    if (!registration) {
      registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', { scope: '/' })
    }
    // Wait until the SW is active/ready
    await navigator.serviceWorker.ready

    const { getToken } = await import('firebase/messaging')

    // Helper to actually fetch token
    const fetchToken = () => getToken(messaging!, { vapidKey, serviceWorkerRegistration: registration! })

    let token: string | null = null
    try {
      token = await fetchToken()
    } catch (err: any) {
      console.error('FCM getToken error (1st try):', { name: err?.name, message: err?.message })
      // If PushManager had a stale subscription, try to unsubscribe and retry once
      try {
        const sub = await registration.pushManager.getSubscription()
        if (sub) {
          const ok = await sub.unsubscribe()
          console.warn('Previous push subscription unsubscribed:', ok)
        }
      } catch (inner) {
        console.warn('Unsubscribe previous subscription failed:', inner)
      }
      // Small delay to allow SW to settle
      await new Promise(res => setTimeout(res, 300))
      // Retry
      token = await fetchToken()
    }
    if (!token) throw new Error('No se pudo obtener el token de notificaciones')

    const res = await fetch('/api/push/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, device_type: 'web' }),
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      throw new Error(data.error || 'Fallo registrando token')
    }

    return token
  } catch (e) {
    // Surface better error context to UI
    const err = e as any
    console.error('enablePushNotifications failed:', { name: err?.name, message: err?.message, stack: err?.stack })
    throw new Error(err?.message || 'No se pudieron habilitar las notificaciones')
  }
}
