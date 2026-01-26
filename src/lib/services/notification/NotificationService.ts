/**
 * Notification Service - Observer Pattern Implementation
 * Manages notification delivery across multiple channels (email, push, SMS)
 */

import { createAdminClient } from '@/lib/supabase/client'
import { EmailNotificationObserver } from './EmailNotificationObserver'
import { PushNotificationObserver } from './PushNotificationObserver'

type NotificationChannel = 'email' | 'push' | 'sms'

type NotificationPreferences = {
  email_enabled?: boolean
  push_enabled?: boolean
  sms_enabled?: boolean
  booking_reminders?: boolean
  promotional_emails?: boolean
  tournament_updates?: boolean
  [key: string]: unknown
}

// Observer Pattern: Subject interface
export interface NotificationObserver {
  update(notification: NotificationData): Promise<void>
}

// Notification data structure
export interface NotificationData {
  userId: string
  type:
    | 'booking_confirmed'
    | 'booking_reminder'
    | 'booking_cancelled'
    | 'booking_cancelled_by_club'
    | 'waitlist_slot_available'
    | 'payment_received'
    | 'payment_failed'
    | 'subscription_update'
    | 'promotion'
    | 'tournament'
    | 'general'
    | 'account_welcome'
    | 'account_password_reset'
    | 'admin_booking_created'
    | 'admin_booking_cancelled'
    | 'admin_daily_summary'
  title: string
  body: string
  data?: Record<string, unknown>
  channels?: NotificationChannel[]
}

// Observer Pattern: Concrete Subject
export class NotificationService {
  private observers: Map<NotificationChannel, NotificationObserver> = new Map()
  private supabase = createAdminClient()

  /**
   * Register an observer (notification channel)
   */
  registerObserver(name: NotificationChannel, observer: NotificationObserver): void {
    this.observers.set(name, observer)
  }

  /**
   * Unregister an observer
   */
  unregisterObserver(name: NotificationChannel): void {
    this.observers.delete(name)
  }

  /**
   * Notify all observers (send notification through all channels)
   */
  async notify(notification: NotificationData): Promise<void> {
    // Get user notification preferences
    const preferences = await this.getUserPreferences(notification.userId)

    // Determine which channels to use
    const channels: NotificationChannel[] = notification.channels || ['email', 'push']

    // Send notification through each enabled channel
    const promises: Promise<void>[] = []

    for (const [channelName, observer] of this.observers) {
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
  private async getUserPreferences(userId: string): Promise<NotificationPreferences> {
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
  private isChannelEnabled(
    preferences: NotificationPreferences,
    channel: NotificationChannel
  ): boolean {
    const channelKey = `${channel}_enabled`
    return preferences[channelKey] !== false
  }

  /**
   * Store notification in database
   * Solo guardamos notificaciones 'push' para la bandeja in-app
   * Los emails se envían por SendGrid y no necesitan guardarse en la DB
   */
  private async storeNotification(notification: NotificationData): Promise<void> {
    // Solo guardar 1 registro con channel 'push' para la bandeja de notificaciones
    const record = {
      user_id: notification.userId,
      notification_type: notification.type,
      channel: 'push' as const,
      title: notification.title,
      body: notification.body,
      data: notification.data || {},
      sent_at: new Date().toISOString(),
    }

    const { error } = await this.supabase.from('notifications').insert(record)

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
    // Parsear fecha asumiendo que viene en timezone de Argentina (UTC-3)
    const start = new Date(data.startDatetime)
    const formattedDate = start.toLocaleDateString('es-AR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      timeZone: 'America/Argentina/Buenos_Aires',
    })
    const formattedTime = start.toLocaleTimeString('es-AR', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/Argentina/Buenos_Aires',
    })

    await this.notify({
      userId: data.userId,
      type: 'booking_confirmed',
      title: 'Reserva confirmada',
      body: `¡Golazo! Tu turno para el ${formattedDate} a las ${formattedTime} hs en ${data.venueName} está confirmado.`,
      data,
      channels: ['email', 'push'],
    })
  }

  /**
   * Account welcome notification
   */
  async sendAccountWelcome(data: { userId: string; fullName?: string }): Promise<void> {
    const name = data.fullName || 'Jugador'

    await this.notify({
      userId: data.userId,
      type: 'account_welcome',
      title: 'Bienvenido a la app',
      body: `Bienvenido a MatchUp, ${name}. Ya podés empezar a reservar tus turnos.`,
      data,
      channels: ['email', 'push'],
    })
  }

  /**
   * Password reset notification (solo para registro en la bandeja in-app)
   * El email de recuperación lo envía directamente Supabase.
   */
  async sendPasswordResetNotification(data: { userId: string }): Promise<void> {
    await this.notify({
      userId: data.userId,
      type: 'account_password_reset',
      title: 'Recuperación de contraseña',
      body: 'Te enviamos un enlace para restablecer tu contraseña.',
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
    venueName?: string
    startDatetime: string
  }): Promise<void> {
    const start = new Date(data.startDatetime)
    const formattedTime = start.toLocaleTimeString('es-AR', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/Argentina/Buenos_Aires',
    })

    await this.notify({
      userId: data.userId,
      type: 'booking_reminder',
      title: 'Recordatorio de reserva',
      body: `Che, no te olvides. Mañana jugás a las ${formattedTime} hs${
        data.venueName ? ` en ${data.venueName}` : ''
      }.`,
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
      title: 'Pago confirmado',
      body: `Recibimos tu pago de $${data.amount}. ¡Gracias!`,
      data,
      channels: ['email'],
    })
  }

  /**
   * Send payment error notification
   */
  async sendPaymentError(data: {
    userId: string
    paymentNumber?: string
    amount?: number
    currency?: string
    bookingNumber?: string
  }): Promise<void> {
    await this.notify({
      userId: data.userId,
      type: 'payment_failed',
      title: 'Error en el pago',
      body: 'Uh, algo salió mal. Tu pago fue rechazado, por favor intentá de nuevo.',
      data,
      channels: ['email', 'push'],
    })
  }

  /**
   * Send cancellation notification
   */
  async sendCancellationNotification(data: {
    userId: string
    bookingNumber: string
    courtName: string
    venueName?: string
    startDatetime?: string
    refundAmount?: number
  }): Promise<void> {
    const start = data.startDatetime ? new Date(data.startDatetime) : null
    const formattedDate = start
      ? start.toLocaleDateString('es-AR', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          timeZone: 'America/Argentina/Buenos_Aires',
        })
      : undefined

    await this.notify({
      userId: data.userId,
      type: 'booking_cancelled',
      title: 'Reserva cancelada',
      body: formattedDate
        ? `Tu turno del ${formattedDate} fue cancelado.`
        : `Tu turno fue cancelado.`,
      data,
      channels: ['email', 'push'],
    })
  }

  /**
   * Send booking cancelled by club notification
   */
  async sendClubCancellationNotification(data: {
    userId: string
    bookingNumber: string
    courtName: string
    venueName: string
    startDatetime: string
    reason?: string
  }): Promise<void> {
    const start = new Date(data.startDatetime)
    const formattedDate = start.toLocaleDateString('es-AR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      timeZone: 'America/Argentina/Buenos_Aires',
    })

    await this.notify({
      userId: data.userId,
      type: 'booking_cancelled_by_club',
      title: 'Turno cancelado por el club',
      body: `Malas noticias: ${
        data.venueName
      } tuvo que cancelar tu turno del ${formattedDate} (por ejemplo, por lluvia). ${
        data.reason || 'Contactate con el club para reprogramar.'
      }`,
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

  /**
   * Subscription / abono updates
   */
  async sendSubscriptionUpdate(data: {
    userId: string
    action: 'purchased' | 'expiring' | 'low_credits'
    planName: string
    remainingCredits?: number
  }): Promise<void> {
    let body = ''

    if (data.action === 'purchased') {
      body = `Compraste el abono de ${data.planName}.`
    } else if (data.action === 'expiring') {
      body = `Atenti: tu abono ${data.planName} está por vencer.`
    } else if (data.action === 'low_credits') {
      body = `Atenti: te queda${data.remainingCredits === 1 ? '' : 'n'} ${
        data.remainingCredits || 0
      } turno${data.remainingCredits === 1 ? '' : 's'} en tu abono.`
    }

    await this.notify({
      userId: data.userId,
      type: 'subscription_update',
      title: 'Actualización de abono',
      body,
      data,
      channels: ['email', 'push'],
    })
  }

  /**
   * Notify venue admins when a new booking is created
   */
  async sendAdminBookingCreated(data: {
    adminId: string
    bookingId: string
    bookingNumber: string
    courtId: string
    courtName: string
    venueId: string
    venueName: string
    startDatetime: string
    endDatetime: string
    userId: string
    status: string
    finalAmount: number
  }): Promise<void> {
    const startStr = new Date(data.startDatetime).toLocaleString('es-AR', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      timeZone: 'America/Argentina/Buenos_Aires',
    })
    const endStr = new Date(data.endDatetime).toLocaleTimeString('es-AR', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/Argentina/Buenos_Aires',
    })

    await this.notify({
      userId: data.adminId,
      type: 'admin_booking_created',
      title: `Nueva reserva - ${data.bookingNumber}`,
      body: `Se reservó ${data.courtName} en ${data.venueName} para el ${startStr} a ${endStr}.`,
      data: {
        bookingId: data.bookingId,
        bookingNumber: data.bookingNumber,
        courtId: data.courtId,
        courtName: data.courtName,
        venueId: data.venueId,
        venueName: data.venueName,
        startDatetime: data.startDatetime,
        endDatetime: data.endDatetime,
        status: data.status,
        finalAmount: data.finalAmount,
        userId: data.userId,
      },
      channels: ['email', 'push'],
    })
  }

  /**
   * Notify venue admins when a booking is cancelled
   */
  async sendAdminBookingCancelled(data: {
    adminId: string
    bookingId: string
    bookingNumber: string
    courtId: string
    courtName: string
    venueId: string
    venueName: string
    startDatetime: string
    endDatetime: string
    userId: string
    finalAmount: number
    reason?: string
  }): Promise<void> {
    const startStr = new Date(data.startDatetime).toLocaleString('es-AR', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      timeZone: 'America/Argentina/Buenos_Aires',
    })
    const endStr = new Date(data.endDatetime).toLocaleTimeString('es-AR', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/Argentina/Buenos_Aires',
    })

    await this.notify({
      userId: data.adminId,
      type: 'admin_booking_cancelled',
      title: `Reserva cancelada - ${data.bookingNumber}`,
      body: `Se canceló la reserva de ${data.courtName} en ${
        data.venueName
      } (del ${startStr} a ${endStr}).${data.reason ? ` Motivo: ${data.reason}.` : ''}`,
      data: {
        bookingId: data.bookingId,
        bookingNumber: data.bookingNumber,
        courtId: data.courtId,
        courtName: data.courtName,
        venueId: data.venueId,
        venueName: data.venueName,
        startDatetime: data.startDatetime,
        endDatetime: data.endDatetime,
        status: 'cancelled',
        userId: data.userId,
        finalAmount: data.finalAmount,
        reason: data.reason,
      },
      channels: ['email', 'push'],
    })
  }

  /**
   * Send a daily summary to venue admins
   */
  async sendAdminDailySummary(data: {
    adminId: string
    venueName: string
    date: string
    totalBookings: number
  }): Promise<void> {
    await this.notify({
      userId: data.adminId,
      type: 'admin_daily_summary',
      title: `Resumen diario de reservas - ${data.venueName}`,
      body: `Fecha ${new Date(data.date).toLocaleDateString('es-AR', {
        timeZone: 'America/Argentina/Buenos_Aires',
      })}: ${data.totalBookings} reservas.`,
      data,
      channels: ['email'],
    })
  }

  /**
   * Waitlist: slot available notification ("¡Turno liberado!")
   */
  async sendWaitlistSlotAvailable(data: {
    userId: string
    courtName: string
    venueName: string
    startDatetime: string
    expiresInMinutes?: number
  }): Promise<void> {
    const start = new Date(data.startDatetime)
    const formattedDate = start.toLocaleDateString('es-AR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      timeZone: 'America/Argentina/Buenos_Aires',
    })
    const formattedTime = start.toLocaleTimeString('es-AR', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/Argentina/Buenos_Aires',
    })

    const minutes = data.expiresInMinutes ?? 10

    await this.notify({
      userId: data.userId,
      type: 'waitlist_slot_available',
      title: '¡Turno liberado!',
      body: `¡Se liberó un lugar el ${formattedDate} a las ${formattedTime} hs en ${data.venueName}! Tenés ${minutes} minutos para confirmarlo.`,
      data,
      channels: ['push'],
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
