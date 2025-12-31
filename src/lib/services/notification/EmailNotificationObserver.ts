/**
 * Email Notification Observer
 * Implements Observer pattern for email notifications using SendGrid
 */

import sgMail from '@sendgrid/mail'
import { NotificationObserver, NotificationData } from './NotificationService'
import { createAdminClient } from '@/lib/supabase/client'

export class EmailNotificationObserver implements NotificationObserver {
  private supabase = createAdminClient()

  constructor() {
    const apiKey = process.env.SENDGRID_API_KEY
    if (apiKey) {
      sgMail.setApiKey(apiKey)
    }
  }

  async update(notification: NotificationData): Promise<void> {
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

      // Get email template
      const template = await this.getEmailTemplate(notification.type)

      // Replace variables in template
      const emailBody = this.replaceVariables(template, {
        user_name: profile.full_name || 'User',
        ...notification.data,
      })

      // Send email
      await sgMail.send({
        to: profile.email,
        from: process.env.SENDGRID_FROM_EMAIL || 'noreply@matchup.com',
        subject: notification.title,
        text: notification.body,
        html: emailBody,
      })

      console.log(`Email sent to ${profile.email}`)
    } catch (error) {
      console.error('Failed to send email:', error)
      throw error
    }
  }

  /**
   * Get email template from database
   */
  private async getEmailTemplate(type: string): Promise<string> {
    const { data } = await this.supabase
      .from('notification_templates')
      .select('email_body')
      .eq('notification_type', type)
      .eq('is_active', true)
      .single()

    return data?.email_body || '{{body}}'
  }

  /**
   * Replace variables in template
   */
  private replaceVariables(
    template: string,
    variables: Record<string, string | number | boolean>
  ): string {
    let result = template

    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{${key}}}`, 'g')
      result = result.replace(regex, String(value))
    }

    return result
  }
}
