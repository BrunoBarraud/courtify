/**
 * Notification Service - Observer Pattern Implementation
 * Manages notification delivery across multiple channels (email, push, SMS)
 */

import { createAdminClient } from '@/lib/supabase/client'
import { EmailNotificationObserver } from './EmailNotificationObserver'
import { PushNotificationObserver } from './PushNotificationObserver'

// Observer Pattern: Subject interface
export interface NotificationObserver {
  update(notification: NotificationData): Promise<void>
}

// Notification data structure
export interface NotificationData {
  userId: string
  type: 'booking_confirmed' | 'booking_reminder' | 'booking_cancelled' | 'payment_received' | 'promotion' | 'tournament' | 'general'
  title: string
  body: string
  data?: Record<string, any>
  channels?: ('email' | 'push' | 'sms')[]
}

// Observer Pattern: Concrete Subject
export class NotificationService {
  private observers: Map<string, NotificationObserver> = new Map()
  private supabase = createAdminClient()

  /**
   * Register an observer (notification channel)
   */
  registerObserver(name: string, observer: NotificationObserver): void {
    this.observers.set(name, observer)
  }

  /**
   * Unregister an observer
   */
  unregisterObserver(name: string): void {
    this.observers.delete(name)
  }

  /**
   * Notify all observers (send notification through all channels)
   */
  async notify(notification: NotificationData): Promise<void> {
    // Get user notification preferences
    const preferences = await this.getUserPreferences(notification.userId)
    
    // Determine which channels to use
    const channels = notification.channels || ['email', 'push']
    
    // Send notification through each enabled channel
    const promises: Promise<void>[] = []
    
    for (const [name, observer] of this.observers) {
      const channelName = name as 'email' | 'push' | 'sms'
      
      // Check if channel is enabled in preferences
      if (channels.includes(channelName) && this.isChannelEnabled(preferences, channelName)) {
        promises.push(observer.update(notification))
      }
    }

    // Store notification in database
    promises.push(this.storeNotification(notification))

    await Promise.allSettled(promises)
  }

  /**
   * Get user notification preferences
   */
  private async getUserPreferences(userId: string) {
    const { data, error } = await this.supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error || !data) {
      // Return default preferences if not found
      return {
        email_enabled: true,
        push_enabled: true,
        sms_enabled: false,
        booking_reminders: true,
        promotional_emails: true,
        tournament_updates: true,
      }
    }

    return data
  }

  /**
   * Check if a channel is enabled for the user
   */
  private isChannelEnabled(preferences: any, channel: 'email' | 'push' | 'sms'): boolean {
    const channelKey = `${channel}_enabled`
    return preferences[channelKey] !== false
  }

  /**
   * Store notification in database
   */
  private async storeNotification(notification: NotificationData): Promise<void> {
    const channels = notification.channels || ['email', 'push']
    
    // Store one record per channel
    const records = channels.map(channel => ({
      user_id: notification.userId,
      notification_type: notification.type,
      channel,
      title: notification.title,
      body: notification.body,
      data: notification.data || {},
      sent_at: new Date().toISOString(),
    }))

    const { error } = await this.supabase
      .from('notifications')
      .insert(records)

    if (error) {
      console.error('Failed to store notification:', error)
    }
  }

  /**
   * Send booking confirmation notification
   */
  async sendBookingConfirmation(data: {
    userId: string
    bookingNumber: string
    courtName: string
    venueName: string
    startDatetime: string
    endDatetime: string
    totalAmount: number
  }): Promise<void> {
    await this.notify({
      userId: data.userId,
      type: 'booking_confirmed',
      title: `Reserva confirmada - ${data.bookingNumber}`,
      body: `Tu reserva en ${data.courtName} (${data.venueName}) fue confirmada para el ${new Date(data.startDatetime).toLocaleDateString('es-AR')}.`,
      data,
      channels: ['email', 'push'],
    })
  }

  /**
   * Send booking reminder notification
   */
  async sendBookingReminder(data: {
    userId: string
    bookingNumber: string
    courtName: string
    startDatetime: string
  }): Promise<void> {
    await this.notify({
      userId: data.userId,
      type: 'booking_reminder',
      title: 'Recordatorio de reserva',
      body: `Recordatorio: tenés una reserva en ${data.courtName} a las ${new Date(data.startDatetime).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}.`,
      data,
      channels: ['email', 'push'],
    })
  }

  /**
   * Send payment confirmation notification
   */
  async sendPaymentConfirmation(data: {
    userId: string
    paymentNumber: string
    amount: number
    currency: string
    bookingNumber?: string
  }): Promise<void> {
    await this.notify({
      userId: data.userId,
      type: 'payment_received',
      title: `Pago recibido - ${data.paymentNumber}`,
      body: `Recibimos tu pago de ${data.amount} ${data.currency}.`,
      data,
      channels: ['email'],
    })
  }

  /**
   * Send cancellation notification
   */
  async sendCancellationNotification(data: {
    userId: string
    bookingNumber: string
    courtName: string
    refundAmount?: number
  }): Promise<void> {
    await this.notify({
      userId: data.userId,
      type: 'booking_cancelled',
      title: `Reserva cancelada - ${data.bookingNumber}`,
      body: `Tu reserva en ${data.courtName} fue cancelada.${data.refundAmount ? ` Se procesará un reembolso de ${data.refundAmount}.` : ''}`,
      data,
      channels: ['email', 'push'],
    })
  }

  /**
   * Send promotional notification
   */
  async sendPromotion(data: {
    userId: string
    title: string
    message: string
    promotionCode?: string
  }): Promise<void> {
    await this.notify({
      userId: data.userId,
      type: 'promotion',
      title: data.title,
      body: data.message,
      data,
      channels: ['email', 'push'],
    })
  }
}

// Singleton instance
export const notificationService = new NotificationService()
// Registrar automáticamente el canal de email si hay API key de SendGrid
if (process.env.SENDGRID_API_KEY) {
  notificationService.registerObserver('email', new EmailNotificationObserver())
}
// Registrar push si hay credenciales de Firebase
if (
  process.env.FIREBASE_PROJECT_ID &&
  process.env.FIREBASE_PRIVATE_KEY &&
  process.env.FIREBASE_CLIENT_EMAIL
) {
  notificationService.registerObserver('push', new PushNotificationObserver())
}
