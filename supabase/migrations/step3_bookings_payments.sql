-- Step 3: Bookings and Payments
-- Execute this after step2

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

-- Booking participants
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
    status TEXT DEFAULT 'active',
    notified_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payments
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payment_number TEXT UNIQUE NOT NULL,
    booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
    subscription_id UUID,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
    amount DECIMAL(10, 2) NOT NULL,
    currency TEXT DEFAULT 'USD' NOT NULL,
    payment_method payment_method NOT NULL,
    payment_status payment_status DEFAULT 'pending' NOT NULL,
    external_payment_id TEXT,
    external_payment_data JSONB DEFAULT '{}',
    receipt_url TEXT,
    invoice_url TEXT,
    refund_amount DECIMAL(10, 2) DEFAULT 0,
    refunded_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
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
    billing_details JSONB NOT NULL,
    line_items JSONB NOT NULL,
    pdf_url TEXT,
    is_sent BOOLEAN DEFAULT false,
    sent_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);
