-- Create table for storing user's favorite venues
CREATE TABLE IF NOT EXISTS public.user_favorite_venues (
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    venue_id UUID NOT NULL REFERENCES public.venues(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (user_id, venue_id)
);

-- Enable RLS
ALTER TABLE public.user_favorite_venues ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own favorites" 
    ON public.user_favorite_venues FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own favorites" 
    ON public.user_favorite_venues FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites" 
    ON public.user_favorite_venues FOR DELETE 
    USING (auth.uid() = user_id);
