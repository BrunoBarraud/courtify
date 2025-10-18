-- Step 6: Indexes, Triggers and Functions
-- Execute this after step5

-- INDEXES
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_venues_slug ON venues(slug);
CREATE INDEX idx_venues_city ON venues(city);
CREATE INDEX idx_venues_is_active ON venues(is_active);
CREATE INDEX idx_courts_venue_id ON courts(venue_id);
CREATE INDEX idx_courts_court_type ON courts(court_type);
CREATE INDEX idx_courts_is_active ON courts(is_active);
CREATE INDEX idx_bookings_court_id ON bookings(court_id);
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_start_datetime ON bookings(start_datetime);
CREATE INDEX idx_bookings_booking_number ON bookings(booking_number);
CREATE INDEX idx_bookings_date_range ON bookings(start_datetime, end_datetime);
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_booking_id ON payments(booking_id);
CREATE INDEX idx_payments_status ON payments(payment_status);
CREATE INDEX idx_payments_payment_number ON payments(payment_number);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
CREATE INDEX idx_waitlist_court_id ON waitlist(court_id);
CREATE INDEX idx_waitlist_user_id ON waitlist(user_id);
CREATE INDEX idx_waitlist_status ON waitlist(status);
CREATE INDEX idx_tournaments_venue_id ON tournaments(venue_id);
CREATE INDEX idx_tournaments_status ON tournaments(status);
CREATE INDEX idx_tournaments_start_date ON tournaments(start_date);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity_type ON audit_logs(entity_type);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- FUNCTIONS AND TRIGGERS
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

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

-- Booking number generation
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

-- Payment number generation
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

-- Invoice number generation
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

-- Booking conflict check
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
