/**
 * Database Types
 * TypeScript types generated from Supabase schema
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          phone: string | null
          avatar_url: string | null
          role: 'customer' | 'venue_admin' | 'super_admin'
          is_active: boolean
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          phone?: string | null
          avatar_url?: string | null
          role?: 'customer' | 'venue_admin' | 'super_admin'
          is_active?: boolean
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          phone?: string | null
          avatar_url?: string | null
          role?: 'customer' | 'venue_admin' | 'super_admin'
          is_active?: boolean
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
      }
      venues: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          address: string
          city: string
          state: string | null
          country: string
          postal_code: string | null
          latitude: number | null
          longitude: number | null
          phone: string | null
          email: string | null
          website: string | null
          logo_url: string | null
          cover_image_url: string | null
          amenities: Json
          opening_hours: Json
          is_active: boolean
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          address: string
          city: string
          state?: string | null
          country: string
          postal_code?: string | null
          latitude?: number | null
          longitude?: number | null
          phone?: string | null
          email?: string | null
          website?: string | null
          logo_url?: string | null
          cover_image_url?: string | null
          amenities?: Json
          opening_hours?: Json
          is_active?: boolean
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          address?: string
          city?: string
          state?: string | null
          country?: string
          postal_code?: string | null
          latitude?: number | null
          longitude?: number | null
          phone?: string | null
          email?: string | null
          website?: string | null
          logo_url?: string | null
          cover_image_url?: string | null
          amenities?: Json
          opening_hours?: Json
          is_active?: boolean
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
      }
      courts: {
        Row: {
          id: string
          venue_id: string
          name: string
          court_type: 'tennis' | 'paddle' | 'football' | 'basketball' | 'volleyball' | 'multipurpose'
          description: string | null
          is_indoor: boolean
          has_lighting: boolean
          surface_type: string | null
          capacity: number | null
          hourly_rate: number
          images: Json
          amenities: Json
          is_active: boolean
          display_order: number
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          venue_id: string
          name: string
          court_type: 'tennis' | 'paddle' | 'football' | 'basketball' | 'volleyball' | 'multipurpose'
          description?: string | null
          is_indoor?: boolean
          has_lighting?: boolean
          surface_type?: string | null
          capacity?: number | null
          hourly_rate: number
          images?: Json
          amenities?: Json
          is_active?: boolean
          display_order?: number
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          venue_id?: string
          name?: string
          court_type?: 'tennis' | 'paddle' | 'football' | 'basketball' | 'volleyball' | 'multipurpose'
          description?: string | null
          is_indoor?: boolean
          has_lighting?: boolean
          surface_type?: string | null
          capacity?: number | null
          hourly_rate?: number
          images?: Json
          amenities?: Json
          is_active?: boolean
          display_order?: number
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
      }
      bookings: {
        Row: {
          id: string
          booking_number: string
          court_id: string
          user_id: string
          start_datetime: string
          end_datetime: string
          status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show'
          total_amount: number
          discount_amount: number
          final_amount: number
          notes: string | null
          cancellation_reason: string | null
          cancelled_at: string | null
          cancelled_by: string | null
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          booking_number?: string
          court_id: string
          user_id: string
          start_datetime: string
          end_datetime: string
          status?: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show'
          total_amount: number
          discount_amount?: number
          final_amount: number
          notes?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          booking_number?: string
          court_id?: string
          user_id?: string
          start_datetime?: string
          end_datetime?: string
          status?: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show'
          total_amount?: number
          discount_amount?: number
          final_amount?: number
          notes?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          payment_number: string
          booking_id: string | null
          subscription_id: string | null
          user_id: string
          amount: number
          currency: string
          payment_method: 'stripe' | 'mercadopago' | 'cash' | 'transfer'
          payment_status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded'
          external_payment_id: string | null
          external_payment_data: Json
          receipt_url: string | null
          invoice_url: string | null
          refund_amount: number
          refunded_at: string | null
          metadata: Json
          created_at: string
          updated_at: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          notification_type: string
          channel: 'email' | 'push' | 'sms'
          title: string
          body: string
          data: Json
          is_read: boolean
          read_at: string | null
          sent_at: string | null
          error_message: string | null
          metadata: Json
          created_at: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: 'customer' | 'venue_admin' | 'super_admin'
      booking_status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show'
      payment_status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded'
      payment_method: 'stripe' | 'mercadopago' | 'cash' | 'transfer'
      court_type: 'tennis' | 'paddle' | 'football' | 'basketball' | 'volleyball' | 'multipurpose'
    }
  }
}
