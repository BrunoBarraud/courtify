/**
 * Database Types
 * TypeScript types generated from Supabase schema
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

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
          is_member: boolean | null
          member_number: string | null
          member_id: string | null
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
          is_member?: boolean | null
          member_number?: string | null
          member_id?: string | null
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
          is_member?: boolean | null
          member_number?: string | null
          member_id?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'profiles_member_id_fkey'
            columns: ['member_id']
            referencedRelation: 'club_members'
            referencedColumns: ['id']
          },
        ]
      }
      club_members: {
        Row: {
          id: string
          member_number: string
          full_name: string
          email: string | null
          phone: string | null
          status: string
          created_at: string
          updated_at: string
          is_active: boolean
          profile_id: string | null
          claimed_at: string | null
        }
        Insert: {
          id?: string
          member_number: string
          full_name: string
          email?: string | null
          phone?: string | null
          status?: string
          created_at?: string
          updated_at?: string
          is_active?: boolean
          profile_id?: string | null
          claimed_at?: string | null
        }
        Update: {
          id?: string
          member_number?: string
          full_name?: string
          email?: string | null
          phone?: string | null
          status?: string
          created_at?: string
          updated_at?: string
          is_active?: boolean
          profile_id?: string | null
          claimed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'club_members_profile_id_fkey'
            columns: ['profile_id']
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
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
        Relationships: []
      }
      courts: {
        Row: {
          id: string
          venue_id: string
          name: string
          court_type:
            | 'Fútbol 5'
            | 'Fútbol 7'
            | 'Fútbol 11'
            | 'Tenis'
            | 'Pádel'
            | 'Básquet'
            | 'Vóley'
            | 'Multipropósito'
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
          court_type:
            | 'Fútbol 5'
            | 'Fútbol 7'
            | 'Fútbol 11'
            | 'Tenis'
            | 'Pádel'
            | 'Básquet'
            | 'Vóley'
            | 'Multipropósito'
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
          court_type?:
            | 'Fútbol 5'
            | 'Fútbol 7'
            | 'Fútbol 11'
            | 'Tenis'
            | 'Pádel'
            | 'Básquet'
            | 'Vóley'
            | 'Multipropósito'
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
        Relationships: [
          {
            foreignKeyName: 'courts_venue_id_fkey'
            columns: ['venue_id']
            referencedRelation: 'venues'
            referencedColumns: ['id']
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: 'bookings_court_id_fkey'
            columns: ['court_id']
            referencedRelation: 'courts'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'bookings_user_id_fkey'
            columns: ['user_id']
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
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
          paid_at: string | null
          refund_amount: number
          refunded_at: string | null
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          payment_number?: string
          booking_id?: string | null
          subscription_id?: string | null
          user_id: string
          amount: number
          currency: string
          payment_method: 'stripe' | 'mercadopago' | 'cash' | 'transfer'
          payment_status?: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded'
          external_payment_id?: string | null
          external_payment_data?: Json
          receipt_url?: string | null
          invoice_url?: string | null
          paid_at?: string | null
          refund_amount?: number
          refunded_at?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          payment_number?: string
          booking_id?: string | null
          subscription_id?: string | null
          user_id?: string
          amount?: number
          currency?: string
          payment_method?: 'stripe' | 'mercadopago' | 'cash' | 'transfer'
          payment_status?: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded'
          external_payment_id?: string | null
          external_payment_data?: Json
          receipt_url?: string | null
          invoice_url?: string | null
          paid_at?: string | null
          refund_amount?: number
          refunded_at?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'payments_booking_id_fkey'
            columns: ['booking_id']
            referencedRelation: 'bookings'
            referencedColumns: ['id']
          },
        ]
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
        Insert: {
          id?: string
          user_id: string
          notification_type: string
          channel: 'email' | 'push' | 'sms'
          title: string
          body: string
          data?: Json
          is_read?: boolean
          read_at?: string | null
          sent_at?: string | null
          error_message?: string | null
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          notification_type?: string
          channel?: 'email' | 'push' | 'sms'
          title?: string
          body?: string
          data?: Json
          is_read?: boolean
          read_at?: string | null
          sent_at?: string | null
          error_message?: string | null
          metadata?: Json
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'notifications_user_id_fkey'
            columns: ['user_id']
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      booking_participants: {
        Row: {
          id: string
          booking_id: string
          name: string
          email: string | null
          phone: string | null
          is_member: boolean
          member_number: string | null
          member_id: string | null
          price_applied: number
          created_at: string
        }
        Insert: {
          id?: string
          booking_id: string
          name: string
          email?: string | null
          phone?: string | null
          is_member?: boolean
          member_number?: string | null
          member_id?: string | null
          price_applied?: number
          created_at?: string
        }
        Update: {
          id?: string
          booking_id?: string
          name?: string
          email?: string | null
          phone?: string | null
          is_member?: boolean
          member_number?: string | null
          member_id?: string | null
          price_applied?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'booking_participants_booking_id_fkey'
            columns: ['booking_id']
            referencedRelation: 'bookings'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'booking_participants_member_id_fkey'
            columns: ['member_id']
            referencedRelation: 'club_members'
            referencedColumns: ['id']
          },
        ]
      }
      waitlist: {
        Row: {
          id: string
          court_id: string
          user_id: string
          preferred_date: string
          preferred_start_time: string
          preferred_end_time: string
          status: 'active' | 'notified' | 'expired' | 'cancelled'
          notified_at: string | null
          expires_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          court_id: string
          user_id: string
          preferred_date: string
          preferred_start_time: string
          preferred_end_time: string
          status?: 'active' | 'notified' | 'expired' | 'cancelled'
          notified_at?: string | null
          expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          court_id?: string
          user_id?: string
          preferred_date?: string
          preferred_start_time?: string
          preferred_end_time?: string
          status?: 'active' | 'notified' | 'expired' | 'cancelled'
          notified_at?: string | null
          expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'waitlist_court_id_fkey'
            columns: ['court_id']
            referencedRelation: 'courts'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'waitlist_user_id_fkey'
            columns: ['user_id']
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      promo_codes: {
        Row: {
          id: string
          code: string
          description: string | null
          discount_type: 'percentage' | 'fixed'
          discount_value: number
          max_discount_amount: number | null
          min_booking_amount: number | null
          start_date: string
          end_date: string
          usage_limit: number | null
          usage_count: number
          is_active: boolean
          applicable_court_types: Json
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          code: string
          description?: string | null
          discount_type: 'percentage' | 'fixed'
          discount_value: number
          max_discount_amount?: number | null
          min_booking_amount?: number | null
          start_date: string
          end_date: string
          usage_limit?: number | null
          usage_count?: number
          is_active?: boolean
          applicable_court_types?: Json
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          code?: string
          description?: string | null
          discount_type?: 'percentage' | 'fixed'
          discount_value?: number
          max_discount_amount?: number | null
          min_booking_amount?: number | null
          start_date?: string
          end_date?: string
          usage_limit?: number | null
          usage_count?: number
          is_active?: boolean
          applicable_court_types?: Json
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }

      promotions: {
        Row: {
          id: string
          code: string
          start_date: string
          end_date: string
          is_active: boolean
          discount_type: 'percentage' | 'fixed'
          discount_value: number
          max_discount_amount: number | null
          usage_limit: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          code: string
          start_date: string
          end_date: string
          is_active?: boolean
          discount_type: 'percentage' | 'fixed'
          discount_value: number
          max_discount_amount?: number | null
          usage_limit?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          code?: string
          start_date?: string
          end_date?: string
          is_active?: boolean
          discount_type?: 'percentage' | 'fixed'
          discount_value?: number
          max_discount_amount?: number | null
          usage_limit?: number | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }

      promotion_usage: {
        Row: {
          id: string
          promotion_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          promotion_id: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          promotion_id?: string
          user_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'promotion_usage_promotion_id_fkey'
            columns: ['promotion_id']
            referencedRelation: 'promotions'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'promotion_usage_user_id_fkey'
            columns: ['user_id']
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }

      payment_events: {
        Row: {
          id: string
          provider: string
          event_id: string
          created_at: string
        }
        Insert: {
          id?: string
          provider: string
          event_id: string
          created_at?: string
        }
        Update: {
          id?: string
          provider?: string
          event_id?: string
          created_at?: string
        }
        Relationships: []
      }

      notification_templates: {
        Row: {
          id: string
          notification_type: string
          email_body: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          notification_type: string
          email_body: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          notification_type?: string
          email_body?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      user_role: 'customer' | 'venue_admin' | 'super_admin'
      booking_status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show'
      payment_status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded'
      payment_method: 'stripe' | 'mercadopago' | 'cash' | 'transfer'
      court_type:
        | 'Fútbol 5'
        | 'Fútbol 7'
        | 'Fútbol 11'
        | 'Tenis'
        | 'Pádel'
        | 'Básquet'
        | 'Vóley'
        | 'Multipropósito'
    }
    CompositeTypes: Record<string, never>
  }
}
