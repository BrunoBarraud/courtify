-- Permitir a usuarios autenticados crear su propio perfil después de OAuth
-- Esta política es necesaria para que Google OAuth funcione correctamente

-- Eliminar política existente si existe
drop policy if exists "Users can insert their own profile" on profiles;

-- Crear política que permita a usuarios autenticados crear su propio perfil
create policy "Users can insert their own profile"
  on profiles for insert
  to authenticated
  with check (auth.uid() = id);

-- Asegurar que usuarios puedan leer su propio perfil
drop policy if exists "Users can view their own profile" on profiles;

create policy "Users can view their own profile"
  on profiles for select
  to authenticated
  using (auth.uid() = id);

-- Permitir a usuarios actualizar su propio perfil
drop policy if exists "Users can update their own profile" on profiles;

create policy "Users can update their own profile"
  on profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);
