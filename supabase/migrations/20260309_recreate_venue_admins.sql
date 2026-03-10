-- Recreate venue_admins table for Multi-Tenant Support
-- Links a user profile (venue_admin) to a specific venue

CREATE TABLE IF NOT EXISTS public.venue_admins (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    venue_id UUID NOT NULL REFERENCES public.venues(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(user_id, venue_id)
);

-- Enable RLS
ALTER TABLE public.venue_admins ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Super admins can manage venue admins"
    ON public.venue_admins FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'super_admin'
        )
    );

CREATE POLICY "Venue admins can see their own links"
    ON public.venue_admins FOR SELECT
    USING (user_id = auth.uid());
