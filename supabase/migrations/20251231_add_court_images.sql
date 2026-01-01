-- Agregar campo para imagen de la cancha
ALTER TABLE courts ADD COLUMN IF NOT EXISTS image_url TEXT;
