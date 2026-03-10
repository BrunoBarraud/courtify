-- Migración para inicializar la sede principal provisional
-- Este proyecto comenzará usando "CanchaLibreApp" como sede principal

-- 1. Eliminar tabla venue_admins
DROP TABLE IF EXISTS venue_admins CASCADE;

-- 2. Renombrar la sede por defecto si tiene el nombre antiguo
UPDATE venues
SET name = 'CanchaLibreApp'
WHERE name = 'Complejo Deportivo Teniente Origone';

-- 3. Eliminar todas las sedes EXCEPTO "CanchaLibreApp"
DELETE FROM venues 
WHERE name != 'CanchaLibreApp';

-- 4. Asegurar que la sede principal esté activa
UPDATE venues 
SET is_active = true 
WHERE name = 'CanchaLibreApp';

-- 5. Comentario: En una sola sede, los roles son:
--    - user: usuarios normales que hacen reservas
--    - venue_admin: administradores de la sede
--    - super_admin: administradores globales de la plataforma
