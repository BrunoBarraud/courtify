-- Asegurar que la columna image_url existe en courts
ALTER TABLE courts ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Hacer que image_url sea opcional (nullable)
ALTER TABLE courts ALTER COLUMN image_url DROP NOT NULL;
