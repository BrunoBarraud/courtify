-- Migración para convertir de multi-sede a una sola sede
-- Este proyecto es exclusivamente para "Complejo Deportivo Teniente Origone"

-- 1. Eliminar tabla venue_admins
DROP TABLE IF EXISTS venue_admins CASCADE;

-- 2. Eliminar todas las sedes EXCEPTO "Complejo Deportivo Teniente Origone"
DELETE FROM venues 
WHERE name != 'Complejo Deportivo Teniente Origone';

-- 3. Asegurar que la sede principal esté activa
UPDATE venues 
SET is_active = true 
WHERE name = 'Complejo Deportivo Teniente Origone';

-- 4. Comentario: En una sola sede, los roles son:
--    - user: usuarios normales que hacen reservas
--    - venue_admin: administradores de la sede
--    - super_admin: administradores globales de la plataforma
