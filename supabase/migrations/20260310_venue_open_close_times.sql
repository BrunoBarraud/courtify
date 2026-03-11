-- Migration to add open_time and close_time to venues
ALTER TABLE public.venues 
ADD COLUMN IF NOT EXISTS open_time TIME NOT NULL DEFAULT '08:00:00',
ADD COLUMN IF NOT EXISTS close_time TIME NOT NULL DEFAULT '23:00:00';

-- Force schema cache reload just in case
NOTIFY pgrst, 'reload schema';
