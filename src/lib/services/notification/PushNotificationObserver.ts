/**
 * Push Notification Observer
 * Implements Observer pattern for push notifications using Firebase Cloud Messaging
 */

import * as admin from 'firebase-admin'
import { NotificationObserver, NotificationData } from './NotificationService'
import { createAdminClient } from '@/lib/supabase/client'

export class PushNotificationObserver implements NotificationObserver {
  private supabase = createAdminClient()
  private fcmInitialized = false

  constructor() {
    this.initializeFirebase()
  }

  private initializeFirebase() {
    try {
      if (!admin.apps.length) {
        const projectId = process.env.FIREBASE_PROJECT_ID
        const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
        const clientEmail = process.env.FIREBASE_CLIENT_EMAIL

        if (projectId && privateKey && clientEmail) {
          admin.initializeApp({
            credential: admin.credential.cert({
              projectId,
              privateKey,
              clientEmail,
            }),
          })
          this.fcmInitialized = true
        }
      } else {
        this.fcmInitialized = true
      }
    } catch (error) {
      console.error('Failed to initialize Firebase:', error)
    }
  }

  async update(notification: NotificationData): Promise<void> {
    if (!this.fcmInitialized) {
      console.warn('Firebase not initialized, skipping push notification')
      return
    }

    try {
      // Get user's push tokens
      const { data: tokens } = await this.supabase
        .from('push_tokens')
        .select('token, device_type')
        .eq('user_id', notification.userId)
        .eq('is_active', true)

      if (!tokens || tokens.length === 0) {
        console.log('No push tokens found for user')
        return
      }

      // Send to all devices
      const promises = tokens.map(({ token }) =>
        admin.messaging().send({
          token,
          notification: {
            title: notification.title,
            body: notification.body,
          },
          data: notification.data ? this.stringifyData(notification.data) : undefined,
          android: {
            priority: 'high',
            notification: {
              sound: 'default',
              clickAction: 'FLUTTER_NOTIFICATION_CLICK',
            },
          },
          apns: {
            payload: {
              aps: {
                sound: 'default',
                badge: 1,
              },
            },
          },
        })
      )

      await Promise.allSettled(promises)
      console.log(`Push notifications sent to ${tokens.length} devices`)
    } catch (error) {
      console.error('Failed to send push notification:', error)
      throw error
    }
  }

  /**
   * Convert data object to string values (FCM requirement)
   */
  private stringifyData(data: Record<string, any>): Record<string, string> {
    const result: Record<string, string> = {}
    for (const [key, value] of Object.entries(data)) {
      result[key] = typeof value === 'string' ? value : JSON.stringify(value)
    }
    return result
  }
}
