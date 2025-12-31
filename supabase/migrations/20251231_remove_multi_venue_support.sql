-- Migración para convertir de multi-sede a una sola sede
-- Elimina la tabla venue_admins y toda la lógica relacionada

-- 1. Eliminar tabla venue_admins
DROP TABLE IF EXISTS venue_admins CASCADE;

-- 2. Simplificar permisos - los venue_admin ahora son simplemente admins
-- No necesitamos cambiar la tabla profiles, solo eliminar las referencias a venue_admins

-- 3. Comentario: En una sola sede, los roles son:
--    - user: usuarios normales que hacen reservas
--    - venue_admin: administradores de la sede (antes eran admins de sedes específicas)
--    - super_admin: administradores globales de la plataforma
