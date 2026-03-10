/**
 * Email Notification Observer
 * Implements Observer pattern for email notifications using Nodemailer
 */

import nodemailer from 'nodemailer'
import { NotificationObserver, NotificationData } from './NotificationService'
import { createAdminClient } from '@/lib/supabase/client'

export class EmailNotificationObserver implements NotificationObserver {
  private supabase = createAdminClient()
  private transporter: nodemailer.Transporter | null = null

  constructor() {
    const user = process.env.SMTP_EMAIL
    const pass = process.env.SMTP_PASSWORD

    if (user && pass) {
      this.transporter = nodemailer.createTransport({
        service: 'gmail', // or standard SMTP settings if not Gmail
        auth: {
          user,
          pass,
        },
      })
    }
  }

  async update(notification: NotificationData): Promise<void> {
    if (!this.transporter) {
      console.warn('Nodemailer transporter not configured. Cannot send email.')
      return
    }

    try {
      // Get user email
      const { data: profile } = await this.supabase
        .from('profiles')
        .select('email, full_name')
        .eq('id', notification.userId)
        .single()

      if (!profile?.email) {
        console.error('User email not found')
        return
      }

      // Generate HTML template based on notification type
      const htmlBody = this.generateHtmlTemplate(notification, profile.full_name || 'Usuario')

      // Send email
      await this.transporter.sendMail({
        from: `"MatchUp System" <${process.env.SMTP_EMAIL}>`,
        to: profile.email,
        subject: notification.title,
        text: notification.body, // Fallback for plain text clients
        html: htmlBody,
      })

      console.log(`Email sent successfully to ${profile.email}`)
    } catch (error) {
      console.error('Failed to send email:', error)
      throw error
    }
  }

  /**
   * Generates a simple beautiful HTML template in-code to avoid database dependencies
   */
  private generateHtmlTemplate(notification: NotificationData, userName: string): string {
    const baseColor = '#4f46e5' // Indigo 600
    
    // Core HTML wrapper pattern
    const wrapHtml = (content: string) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333; border: 1px solid #eee; border-radius: 10px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: ${baseColor}; margin: 0;">MatchUp</h1>
          <p style="color: #666; margin-top: 5px;">Tu plataforma deportiva</p>
        </div>
        ${content}
        <div style="margin-top: 30px; pt-10; border-top: 1px solid #eee; padding-top: 20px; text-align: center; font-size: 12px; color: #888;">
          <p>Este es un correo automático. Por favor no respondas a este mensaje.</p>
        </div>
      </div>
    `

    // Extract dynamic data from notification.data
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const d = (notification.data as Record<string, any>) || {}

    // 1. Booking Confirmation to User
    if (notification.type === 'booking_confirmed') {
      return wrapHtml(`
        <h2 style="color: #111;">¡Reserva confirmada, ${userName}!</h2>
        <p>${notification.body}</p>
        
        <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #374151;">Detalles del Turno</h3>
          <ul style="list-style: none; padding-left: 0; margin-bottom: 0;">
            <li style="margin-bottom: 8px;"><strong>Sede:</strong> ${d.venueName || 'La sede'}</li>
            <li style="margin-bottom: 8px;"><strong>Cancha:</strong> ${d.courtName || 'Cancha asignada'}</li>
            <li style="margin-bottom: 8px;"><strong>Código de Reserva:</strong> #${d.bookingNumber || 'N/A'}</li>
            <li style="margin-bottom: 0;"><strong>Monto Total:</strong> $${d.totalAmount?.toLocaleString('es-AR') || 'Pendiente'}</li>
          </ul>
        </div>
      `)
    }

    // 2. Notification to Admin for newly created booking
    if (notification.type === 'admin_booking_created') {
      return wrapHtml(`
        <h2 style="color: #111;">¡Nueva Reserva Ingresada!</h2>
        <p>Hola Administrador, tenés un nuevo turno agendado en <strong>${d.venueName}</strong>.</p>
        
        <div style="background-color: #f0fdf4; border-left: 4px solid #16a34a; padding: 15px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #16a34a;">Ganancia: $${d.finalAmount?.toLocaleString('es-AR') || 0}</h3>
          <ul style="list-style: none; padding-left: 0; margin-bottom: 0; color: #374151;">
            <li style="margin-bottom: 8px;"><strong>Cancha:</strong> ${d.courtName}</li>
            <li style="margin-bottom: 8px;"><strong>Reserva Nº:</strong> #${d.bookingNumber}</li>
            <li style="margin-bottom: 0;"><strong>Estado:</strong> ${d.status === 'confirmed' ? 'Confirmado' : 'Pendiente / Reservado'}</li>
          </ul>
        </div>
        <p style="margin-top: 20px;"><a href="https://matchup.com/dashboard" style="color: ${baseColor}; text-decoration: none; font-weight: bold;">Acceder al panel de control ></a></p>
      `)
    }

    // 3. Fallback for any other type
    return wrapHtml(`
      <h2 style="color: #111;">${notification.title}</h2>
      <p style="font-size: 16px; line-height: 1.5;">${notification.body}</p>
    `)
  }
}
