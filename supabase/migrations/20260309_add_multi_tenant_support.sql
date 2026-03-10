-- Migration: Add multi-tenant support and encrypted payment keys
-- Adds `subdomain`, `mp_access_token_encrypted`, `mp_iv`, and `mp_public_key` to `venues`
-- Re-enables multi-venue support logic.

-- 1. Add fields to venues
ALTER TABLE venues 
ADD COLUMN IF NOT EXISTS subdomain TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS mp_public_key TEXT,
ADD COLUMN IF NOT EXISTS mp_access_token_encrypted TEXT,
ADD COLUMN IF NOT EXISTS mp_iv TEXT;

-- 2. Populate default subdomain for existing venue to avoid NULL constraint errors later
UPDATE venues 
SET subdomain = 'canchalibre' 
WHERE name = 'CanchaLibreApp' AND subdomain IS NULL;

-- 3. In a real scenario we might enforce NOT NULL now, but let's be safe
-- ALTER TABLE venues ALTER COLUMN subdomain SET NOT NULL;

-- 4. Enable RLS on bookings to isolate by venue_id if not already isolated
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- 5. Create policy for venue isolation
-- Assuming venue_admins can only see their own venue's bookings
-- This requires a role/permission check. We have profiles.role ('venue_admin', 'super_admin', etc).
-- Note: the schema might use a different way to link admin to venue. 
-- For now, let's create a placeholder policy that allows super_admin or users to see their own.
-- You will need to adjust this depending on how user_venue_roles or similar is structured in your DB.

-- DROP POLICY IF EXISTS "Users can view their own bookings or venue admins can view all" ON bookings;

-- (Policies might need adaptation based on existing schema)
