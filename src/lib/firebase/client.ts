import { initializeApp, getApps } from 'firebase/app'
import { getMessaging, isSupported, Messaging } from 'firebase/messaging'
import { getAnalytics, isSupported as analyticsSupported, Analytics } from 'firebase/analytics'

let messagingPromise: Promise<Messaging | null> | null = null

export const initFirebase = () => {
  const config = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  }
  if (!getApps().length) {
    initializeApp(config as any)
  }
}

export const getMessagingIfSupported = async () => {
  if (!messagingPromise) {
    messagingPromise = (async () => {
      try {
        if (await isSupported()) {
          const messaging = getMessaging()
          return messaging
        }
      } catch (e) {
        console.warn('FCM not supported on this browser', e)
      }
      return null
    })()
  }
  return messagingPromise
}

let analyticsPromise: Promise<Analytics | null> | null = null
export const getAnalyticsIfAvailable = async () => {
  if (typeof window === 'undefined') return null
  if (!analyticsPromise) {
    analyticsPromise = (async () => {
      try {
        if (await analyticsSupported()) {
          return getAnalytics()
        }
      } catch (e) {
        console.warn('Analytics not supported', e)
      }
      return null
    })()
  }
  return analyticsPromise
}
