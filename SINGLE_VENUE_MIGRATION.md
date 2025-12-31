# Migración de Multi-Sede a Una Sola Sede

## ✅ Cambios Completados

### 1. Base de Datos

- **Migración SQL creada**: `supabase/migrations/20251231_remove_multi_venue_support.sql`
  - Elimina la tabla `venue_admins`
  - Simplifica la estructura para una sola sede

### 2. Sistema de Permisos

- **`src/lib/auth/permissions.ts`**: Simplificado

  - `checkVenuePermission()`: Ahora solo verifica si el usuario es admin (super_admin o venue_admin)
  - `getVenuePermissions()`: Retorna todos los permisos para admins
  - `getUserVenues()`: Retorna la única sede activa para admins
  - Eliminadas todas las referencias a la tabla `venue_admins`

- **`src/lib/auth/roles.ts`**: Agregada función `isVenueAdmin()`

- **`src/lib/auth/helpers.ts`**: Simplificado
  - `checkVenueAccess()`: Ya no verifica `venue_admins`, solo verifica si es admin

### 3. Servicios

- **`src/lib/services/BookingService.ts`**: Actualizado
  - Eliminadas notificaciones automáticas a `venue_admins` en `createBooking()`
  - Eliminadas notificaciones automáticas a `venue_admins` en `cancelBooking()`
  - Agregados comentarios TODO para implementar notificaciones de forma diferente

## 📋 Tareas Pendientes

### 1. Rutas API que Necesitan Actualización

Las siguientes rutas API aún tienen referencias a `venue_admins` y necesitan ser actualizadas:

- `src/app/api/admin/venue-admins/route.ts` - **ELIMINAR COMPLETAMENTE**
- `src/app/api/admin/users/[id]/route.ts` - Eliminar cleanup de `venue_admins`
- `src/app/api/admin/bookings/route.ts` - Eliminar verificación de `venue_admins`
- `src/app/api/admin/bookings/[id]/route.ts` - Eliminar verificación de `venue_admins`
- `src/app/api/venues/route.ts` - Eliminar inserción en `venue_admins`
- `src/app/api/venues/[id]/route.ts` - Eliminar verificación de `venue_admins`
- `src/app/api/venues/[id]/courts/route.ts` - Eliminar verificación de `venue_admins`
- `src/app/api/courts/[id]/availability-rules/route.ts` - Eliminar verificación de `venue_admins`
- `src/app/api/courts/[id]/blocked-periods/route.ts` - Eliminar verificación de `venue_admins`
- `src/app/api/cron/admin-daily-summary/route.ts` - Eliminar notificaciones a `venue_admins`

### 2. Páginas Admin que Necesitan Actualización/Eliminación

- `src/app/admin/venues/` - **ELIMINAR COMPLETAMENTE** (gestión de múltiples sedes)
- `src/app/admin/users/[id]/permissions/page.tsx` - Eliminar gestión de permisos por sede
- `src/app/admin/users/page.tsx` - Eliminar asignación de admins a sedes

### 3. Formularios y Componentes

- `src/app/bookings/new/page.tsx` - Eliminar selector de sede (siempre usar la única sede activa)
- Cualquier componente que muestre/seleccione múltiples sedes

### 4. Tests

- `src/app/api/admin/bookings/__tests__/route.test.ts` - Actualizar mocks que usan `venue_admins`

### 5. Tipos de Base de Datos

- Regenerar tipos de Supabase después de aplicar la migración:
  ```bash
  npm run supabase:types
  ```

## 🔧 Pasos para Completar la Migración

1. **Aplicar la migración SQL en Supabase**:

   - En Supabase Dashboard > SQL Editor
   - Ejecutar el contenido de `supabase/migrations/20251231_remove_multi_venue_support.sql`

2. **Regenerar tipos de TypeScript**:

   ```bash
   npm run supabase:types
   ```

3. **Actualizar las rutas API** (ver lista arriba)

4. **Eliminar páginas de gestión de venues**

5. **Simplificar formulario de reservas**

6. **Actualizar tests**

7. **Probar toda la funcionalidad**:
   - Login/registro
   - Creación de reservas
   - Gestión de canchas
   - Panel de administración

## 📝 Notas Importantes

### Roles en Una Sola Sede

- **user**: Usuarios normales que hacen reservas
- **venue_admin**: Administradores de la sede (tienen todos los permisos administrativos)
- **super_admin**: Administradores globales de la plataforma

### Cambios en Permisos

Antes (multi-sede):

- Los `venue_admin` estaban asignados a sedes específicas vía tabla `venue_admins`
- Cada admin tenía permisos granulares por sede

Ahora (una sola sede):

- Los `venue_admin` tienen acceso completo a la única sede
- No hay necesidad de asignaciones ni permisos granulares
- Simplificación: `venue_admin` = admin de la sede, `super_admin` = admin global

### Notificaciones

Las notificaciones automáticas a admins de sede fueron removidas de `BookingService`.
Considerar implementar un sistema de notificaciones diferente si es necesario.

## ⚠️ Advertencias

- **No aplicar la migración SQL hasta estar seguro**: Una vez eliminada la tabla `venue_admins`, no hay vuelta atrás sin backup
- **Los errores de TypeScript en BookingService** se resolverán automáticamente al regenerar los tipos después de aplicar la migración
- **Hacer backup de la base de datos** antes de aplicar cambios en producción
