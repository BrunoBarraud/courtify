-- Agregar campo plus_code para Google Plus Codes
ALTER TABLE venues ADD COLUMN IF NOT EXISTS plus_code TEXT;

COMMENT ON COLUMN venues.plus_code IS 'Google Plus Code (Open Location Code) para ubicación precisa';
