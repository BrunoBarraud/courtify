-- Agregar campo para foto de perfil del venue
ALTER TABLE venues ADD COLUMN IF NOT EXISTS profile_image_url TEXT;

-- Crear bucket de storage para imágenes del venue si no existe
INSERT INTO storage.buckets (id, name, public)
VALUES ('venue-images', 'venue-images', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas de storage para venue-images
CREATE POLICY "Public can view venue images"
ON storage.objects FOR SELECT
USING (bucket_id = 'venue-images');

CREATE POLICY "Admins can upload venue images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'venue-images' 
  AND auth.uid() IN (
    SELECT id FROM profiles WHERE role IN ('super_admin', 'venue_admin')
  )
);

CREATE POLICY "Admins can update venue images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'venue-images' 
  AND auth.uid() IN (
    SELECT id FROM profiles WHERE role IN ('super_admin', 'venue_admin')
  )
);

CREATE POLICY "Admins can delete venue images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'venue-images' 
  AND auth.uid() IN (
    SELECT id FROM profiles WHERE role IN ('super_admin', 'venue_admin')
  )
);
