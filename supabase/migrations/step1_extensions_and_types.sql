-- Step 1: Extensions and Custom Types
-- Execute this first in Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types
CREATE TYPE user_role AS ENUM ('customer', 'venue_admin', 'super_admin');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed', 'no_show');
CREATE TYPE payment_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'refunded');
CREATE TYPE payment_method AS ENUM ('stripe', 'mercadopago', 'cash', 'transfer');
CREATE TYPE court_type AS ENUM ('tennis', 'paddle', 'football', 'basketball', 'volleyball', 'multipurpose');
CREATE TYPE notification_type AS ENUM ('booking_confirmed', 'booking_reminder', 'booking_cancelled', 'payment_received', 'promotion', 'tournament', 'general');
CREATE TYPE notification_channel AS ENUM ('email', 'push', 'sms');
CREATE TYPE subscription_status AS ENUM ('active', 'paused', 'cancelled', 'expired');
CREATE TYPE day_of_week AS ENUM ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday');
