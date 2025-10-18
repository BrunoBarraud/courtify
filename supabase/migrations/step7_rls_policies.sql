-- Step 7: Row Level Security (RLS) Policies
-- Execute this after step6

-- Enable RLS
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

-- Venues policies
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
