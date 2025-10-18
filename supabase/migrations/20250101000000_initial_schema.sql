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

-- =====================================================
-- USERS AND AUTHENTICATION
-- =====================================================

-- Profiles table (extends Supabase auth.users)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    phone TEXT,
    avatar_url TEXT,
    role user_role DEFAULT 'customer' NOT NULL,
    is_active BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- VENUES AND COURTS
-- =====================================================

-- Venues (clubs/complexes)
CREATE TABLE venues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT,
    country TEXT NOT NULL,
    postal_code TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    phone TEXT,
    email TEXT,
    website TEXT,
    logo_url TEXT,
    cover_image_url TEXT,
    amenities JSONB DEFAULT '[]', -- ['parking', 'wifi', 'lockers', 'showers', 'cafe']
    opening_hours JSONB DEFAULT '{}', -- {monday: {open: '08:00', close: '22:00'}, ...}
    is_active BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Venue administrators
CREATE TABLE venue_admins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    permissions JSONB DEFAULT '{}', -- {can_manage_bookings: true, can_manage_courts: true, ...}
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(venue_id, user_id)
);

-- Courts
CREATE TABLE courts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    court_type court_type NOT NULL,
    description TEXT,
    is_indoor BOOLEAN DEFAULT false,
    has_lighting BOOLEAN DEFAULT false,
    surface_type TEXT, -- 'grass', 'clay', 'hard', 'synthetic'
    capacity INTEGER,
    hourly_rate DECIMAL(10, 2) NOT NULL,
    images JSONB DEFAULT '[]',
    amenities JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Court availability rules
CREATE TABLE court_availability_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    court_id UUID NOT NULL REFERENCES courts(id) ON DELETE CASCADE,
    day_of_week day_of_week NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN DEFAULT true,
    price_override DECIMAL(10, 2), -- Override hourly_rate for specific times
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Court blocked periods (maintenance, events, etc.)
CREATE TABLE court_blocked_periods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    court_id UUID NOT NULL REFERENCES courts(id) ON DELETE CASCADE,
    start_datetime TIMESTAMPTZ NOT NULL,
    end_datetime TIMESTAMPTZ NOT NULL,
    reason TEXT,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- BOOKINGS
-- =====================================================

-- Bookings
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_number TEXT UNIQUE NOT NULL,
    court_id UUID NOT NULL REFERENCES courts(id) ON DELETE RESTRICT,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
    start_datetime TIMESTAMPTZ NOT NULL,
    end_datetime TIMESTAMPTZ NOT NULL,
    status booking_status DEFAULT 'pending' NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    discount_amount DECIMAL(10, 2) DEFAULT 0,
    final_amount DECIMAL(10, 2) NOT NULL,
    notes TEXT,
    cancellation_reason TEXT,
    cancelled_at TIMESTAMPTZ,
    cancelled_by UUID REFERENCES profiles(id),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT valid_datetime CHECK (end_datetime > start_datetime)
);

-- Booking participants (for group bookings)
CREATE TABLE booking_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id),
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Waitlist
CREATE TABLE waitlist (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    court_id UUID NOT NULL REFERENCES courts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    preferred_date DATE NOT NULL,
    preferred_start_time TIME NOT NULL,
    preferred_end_time TIME NOT NULL,
    status TEXT DEFAULT 'active', -- 'active', 'notified', 'booked', 'expired'
    notified_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- SUBSCRIPTIONS (ABONOS)
-- =====================================================

-- Subscription plans
CREATE TABLE subscription_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    duration_days INTEGER NOT NULL, -- 30, 90, 365
    credits INTEGER NOT NULL, -- Number of bookings allowed
    price DECIMAL(10, 2) NOT NULL,
    court_types JSONB DEFAULT '[]', -- Allowed court types
    time_restrictions JSONB DEFAULT '{}', -- {weekdays: true, weekends: false, peak_hours: false}
    is_active BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User subscriptions
CREATE TABLE user_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES subscription_plans(id) ON DELETE RESTRICT,
    status subscription_status DEFAULT 'active' NOT NULL,
    credits_remaining INTEGER NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    auto_renew BOOLEAN DEFAULT false,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscription usage
CREATE TABLE subscription_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subscription_id UUID NOT NULL REFERENCES user_subscriptions(id) ON DELETE CASCADE,
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    credits_used INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- PAYMENTS
-- =====================================================

-- Payments
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payment_number TEXT UNIQUE NOT NULL,
    booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
    subscription_id UUID REFERENCES user_subscriptions(id) ON DELETE SET NULL,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
    amount DECIMAL(10, 2) NOT NULL,
    currency TEXT DEFAULT 'USD' NOT NULL,
    payment_method payment_method NOT NULL,
    payment_status payment_status DEFAULT 'pending' NOT NULL,
    external_payment_id TEXT, -- Stripe/MercadoPago transaction ID
    external_payment_data JSONB DEFAULT '{}',
    receipt_url TEXT,
    invoice_url TEXT,
    refund_amount DECIMAL(10, 2) DEFAULT 0,
    refunded_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT payment_entity CHECK (
        (booking_id IS NOT NULL AND subscription_id IS NULL) OR
        (booking_id IS NULL AND subscription_id IS NOT NULL)
    )
);

-- Invoices
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_number TEXT UNIQUE NOT NULL,
    payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
    venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE RESTRICT,
    issue_date DATE NOT NULL,
    due_date DATE,
    subtotal DECIMAL(10, 2) NOT NULL,
    tax_amount DECIMAL(10, 2) DEFAULT 0,
    total_amount DECIMAL(10, 2) NOT NULL,
    billing_details JSONB NOT NULL, -- {name, address, tax_id, ...}
    line_items JSONB NOT NULL, -- [{description, quantity, unit_price, amount}, ...]
    pdf_url TEXT,
    is_sent BOOLEAN DEFAULT false,
    sent_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- PROMOTIONS AND DISCOUNTS
-- =====================================================

-- Promotions
CREATE TABLE promotions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    venue_id UUID REFERENCES venues(id) ON DELETE CASCADE,
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    discount_type TEXT NOT NULL, -- 'percentage', 'fixed_amount'
    discount_value DECIMAL(10, 2) NOT NULL,
    min_purchase_amount DECIMAL(10, 2),
    max_discount_amount DECIMAL(10, 2),
    usage_limit INTEGER, -- Total usage limit
    usage_limit_per_user INTEGER,
    applicable_court_types JSONB DEFAULT '[]',
    applicable_venues JSONB DEFAULT '[]',
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    is_active BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Promotion usage tracking
CREATE TABLE promotion_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    promotion_id UUID NOT NULL REFERENCES promotions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
    discount_amount DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TOURNAMENTS
-- =====================================================

-- Tournaments
CREATE TABLE tournaments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    sport_type court_type NOT NULL,
    tournament_type TEXT NOT NULL, -- 'single_elimination', 'double_elimination', 'round_robin', 'league'
    max_participants INTEGER NOT NULL,
    registration_fee DECIMAL(10, 2) DEFAULT 0,
    prize_pool DECIMAL(10, 2),
    registration_start TIMESTAMPTZ NOT NULL,
    registration_end TIMESTAMPTZ NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status TEXT DEFAULT 'draft', -- 'draft', 'open', 'in_progress', 'completed', 'cancelled'
    rules TEXT,
    image_url TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tournament participants
CREATE TABLE tournament_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    team_name TEXT,
    partner_name TEXT, -- For doubles
    registration_date TIMESTAMPTZ DEFAULT NOW(),
    payment_status payment_status DEFAULT 'pending',
    is_confirmed BOOLEAN DEFAULT false,
    seed_number INTEGER,
    metadata JSONB DEFAULT '{}',
    UNIQUE(tournament_id, user_id)
);

-- Tournament matches
CREATE TABLE tournament_matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
    round_number INTEGER NOT NULL,
    match_number INTEGER NOT NULL,
    court_id UUID REFERENCES courts(id),
    booking_id UUID REFERENCES bookings(id),
    participant1_id UUID REFERENCES tournament_participants(id),
    participant2_id UUID REFERENCES tournament_participants(id),
    scheduled_datetime TIMESTAMPTZ,
    winner_id UUID REFERENCES tournament_participants(id),
    score JSONB, -- {sets: [{p1: 6, p2: 4}, ...]}
    status TEXT DEFAULT 'scheduled', -- 'scheduled', 'in_progress', 'completed', 'cancelled'
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- NOTIFICATIONS
-- =====================================================

-- Notification templates
CREATE TABLE notification_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    notification_type notification_type NOT NULL,
    subject TEXT,
    email_body TEXT,
    push_body TEXT,
    sms_body TEXT,
    variables JSONB DEFAULT '[]', -- ['user_name', 'booking_date', ...]
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User notifications
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    notification_type notification_type NOT NULL,
    channel notification_channel NOT NULL,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    data JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMPTZ,
    sent_at TIMESTAMPTZ,
    error_message TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User notification preferences
CREATE TABLE notification_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    email_enabled BOOLEAN DEFAULT true,
    push_enabled BOOLEAN DEFAULT true,
    sms_enabled BOOLEAN DEFAULT false,
    booking_reminders BOOLEAN DEFAULT true,
    promotional_emails BOOLEAN DEFAULT true,
    tournament_updates BOOLEAN DEFAULT true,
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Push notification tokens
CREATE TABLE push_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    token TEXT NOT NULL,
    device_type TEXT, -- 'ios', 'android', 'web'
    device_id TEXT,
    is_active BOOLEAN DEFAULT true,
    last_used_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, token)
);

-- =====================================================
-- CANCELLATION POLICIES
-- =====================================================

-- Cancellation policies
CREATE TABLE cancellation_policies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    rules JSONB NOT NULL, -- [{hours_before: 24, refund_percentage: 100}, {hours_before: 12, refund_percentage: 50}, ...]
    is_default BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- REVIEWS AND RATINGS
-- =====================================================

-- Reviews
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title TEXT,
    comment TEXT,
    response TEXT, -- Venue response
    responded_at TIMESTAMPTZ,
    responded_by UUID REFERENCES profiles(id),
    is_verified BOOLEAN DEFAULT false,
    is_visible BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(booking_id, user_id)
);

-- =====================================================
-- AUDIT LOG
-- =====================================================

-- Audit log for tracking important actions
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id),
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================

-- Profiles
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_role ON profiles(role);

-- Venues
CREATE INDEX idx_venues_slug ON venues(slug);
CREATE INDEX idx_venues_city ON venues(city);
CREATE INDEX idx_venues_is_active ON venues(is_active);

-- Courts
CREATE INDEX idx_courts_venue_id ON courts(venue_id);
CREATE INDEX idx_courts_court_type ON courts(court_type);
CREATE INDEX idx_courts_is_active ON courts(is_active);

-- Bookings
CREATE INDEX idx_bookings_court_id ON bookings(court_id);
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_start_datetime ON bookings(start_datetime);
CREATE INDEX idx_bookings_booking_number ON bookings(booking_number);
CREATE INDEX idx_bookings_date_range ON bookings(start_datetime, end_datetime);

-- Payments
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_booking_id ON payments(booking_id);
CREATE INDEX idx_payments_status ON payments(payment_status);
CREATE INDEX idx_payments_payment_number ON payments(payment_number);

-- Notifications
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

-- Waitlist
CREATE INDEX idx_waitlist_court_id ON waitlist(court_id);
CREATE INDEX idx_waitlist_user_id ON waitlist(user_id);
CREATE INDEX idx_waitlist_status ON waitlist(status);

-- Tournaments
CREATE INDEX idx_tournaments_venue_id ON tournaments(venue_id);
CREATE INDEX idx_tournaments_status ON tournaments(status);
CREATE INDEX idx_tournaments_start_date ON tournaments(start_date);

-- Audit logs
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity_type ON audit_logs(entity_type);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- =====================================================
-- FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_venues_updated_at BEFORE UPDATE ON venues
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_courts_updated_at BEFORE UPDATE ON courts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_promotions_updated_at BEFORE UPDATE ON promotions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to generate booking number
CREATE OR REPLACE FUNCTION generate_booking_number()
RETURNS TRIGGER AS $$
BEGIN
    NEW.booking_number = 'BK-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(nextval('booking_number_seq')::TEXT, 6, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE booking_number_seq;

CREATE TRIGGER set_booking_number BEFORE INSERT ON bookings
    FOR EACH ROW EXECUTE FUNCTION generate_booking_number();

-- Function to generate payment number
CREATE OR REPLACE FUNCTION generate_payment_number()
RETURNS TRIGGER AS $$
BEGIN
    NEW.payment_number = 'PAY-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(nextval('payment_number_seq')::TEXT, 6, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE payment_number_seq;

CREATE TRIGGER set_payment_number BEFORE INSERT ON payments
    FOR EACH ROW EXECUTE FUNCTION generate_payment_number();

-- Function to generate invoice number
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TRIGGER AS $$
BEGIN
    NEW.invoice_number = 'INV-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(nextval('invoice_number_seq')::TEXT, 6, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE invoice_number_seq;

CREATE TRIGGER set_invoice_number BEFORE INSERT ON invoices
    FOR EACH ROW EXECUTE FUNCTION generate_invoice_number();

-- Function to check booking conflicts
CREATE OR REPLACE FUNCTION check_booking_conflict()
RETURNS TRIGGER AS $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM bookings
        WHERE court_id = NEW.court_id
        AND status NOT IN ('cancelled')
        AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::UUID)
        AND (
            (NEW.start_datetime >= start_datetime AND NEW.start_datetime < end_datetime)
            OR (NEW.end_datetime > start_datetime AND NEW.end_datetime <= end_datetime)
            OR (NEW.start_datetime <= start_datetime AND NEW.end_datetime >= end_datetime)
        )
    ) THEN
        RAISE EXCEPTION 'Booking conflict: Court is already booked for this time slot';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_booking_conflict_trigger BEFORE INSERT OR UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION check_booking_conflict();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE venue_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE courts ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Venues policies (public read, admin write)
CREATE POLICY "Anyone can view active venues" ON venues
    FOR SELECT USING (is_active = true);

CREATE POLICY "Venue admins can update their venues" ON venues
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM venue_admins
            WHERE venue_id = venues.id AND user_id = auth.uid()
        )
    );

-- Courts policies
CREATE POLICY "Anyone can view active courts" ON courts
    FOR SELECT USING (is_active = true);

CREATE POLICY "Venue admins can manage courts" ON courts
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM venue_admins
            WHERE venue_id = courts.venue_id AND user_id = auth.uid()
        )
    );

-- Bookings policies
CREATE POLICY "Users can view their own bookings" ON bookings
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create bookings" ON bookings
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own bookings" ON bookings
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Venue admins can view venue bookings" ON bookings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM courts c
            JOIN venue_admins va ON va.venue_id = c.venue_id
            WHERE c.id = bookings.court_id AND va.user_id = auth.uid()
        )
    );

-- Payments policies
CREATE POLICY "Users can view their own payments" ON payments
    FOR SELECT USING (user_id = auth.uid());

-- Notifications policies
CREATE POLICY "Users can view their own notifications" ON notifications
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications" ON notifications
    FOR UPDATE USING (user_id = auth.uid());

-- =====================================================
-- SEED DATA (Optional - for development)
-- =====================================================

-- Insert default notification templates
INSERT INTO notification_templates (name, notification_type, subject, email_body, push_body) VALUES
('booking_confirmed', 'booking_confirmed', 
 'Booking Confirmed - {{booking_number}}',
 'Hi {{user_name}},\n\nYour booking has been confirmed!\n\nBooking Details:\n- Court: {{court_name}}\n- Date: {{booking_date}}\n- Time: {{booking_time}}\n- Total: {{total_amount}}\n\nThank you for choosing Courtify!',
 'Your booking for {{court_name}} on {{booking_date}} at {{booking_time}} has been confirmed!'),

('booking_reminder', 'booking_reminder',
 'Reminder: Upcoming Booking - {{booking_number}}',
 'Hi {{user_name}},\n\nThis is a reminder that you have a booking tomorrow:\n\n- Court: {{court_name}}\n- Date: {{booking_date}}\n- Time: {{booking_time}}\n\nSee you there!',
 'Reminder: You have a booking tomorrow at {{court_name}} - {{booking_time}}'),

('payment_received', 'payment_received',
 'Payment Received - {{payment_number}}',
 'Hi {{user_name}},\n\nWe have received your payment of {{amount}}.\n\nPayment Number: {{payment_number}}\nBooking Number: {{booking_number}}\n\nYour receipt is attached.',
 'Payment of {{amount}} received for booking {{booking_number}}');
