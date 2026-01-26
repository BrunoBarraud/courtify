-- Socios estrictos + reglas de precios por persona (extensible)

-- Pre-requisitos (por si no se ejecutaron migraciones previas)
create extension if not exists "uuid-ossp";

create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- 0) Crear tabla club_members si todavía no existe
create table if not exists club_members (
  id uuid primary key default uuid_generate_v4(),
  member_number text not null unique,
  full_name text not null,
  email text,
  phone text,
  status text not null default 'active',
  is_active boolean not null default true,
  profile_id uuid references profiles(id),
  claimed_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create trigger update_club_members_updated_at
  before update on club_members
  for each row
  execute function update_updated_at_column();

-- 1) Endurecer padrón de socios (club_members)
alter table club_members
  add column if not exists profile_id uuid references profiles(id);

create unique index if not exists club_members_profile_id_unique_idx
  on club_members(profile_id)
  where profile_id is not null;

alter table club_members
  add column if not exists claimed_at timestamp with time zone;

alter table club_members
  add column if not exists is_active boolean not null default true;

-- Mantener compatibilidad con columna status existente
update club_members
set is_active = (status = 'active')
where status is not null;

-- 2) Ajustar columnas en profiles (compatibilidad si ya existen)
alter table profiles add column if not exists is_member boolean default false;
alter table profiles add column if not exists member_number text;
alter table profiles add column if not exists member_id uuid references club_members(id);

-- 3) Enriquecer booking_participants para pricing por persona
alter table booking_participants
  add column if not exists is_member boolean not null default false;

alter table booking_participants
  add column if not exists member_number text;

alter table booking_participants
  add column if not exists member_id uuid references club_members(id);

alter table booking_participants
  add column if not exists price_applied numeric not null default 0;

-- 4) Reglas de precio por cancha (modo por persona hoy; fácil migrar a por hora/turno)
create table if not exists pricing_rules (
  id uuid primary key default uuid_generate_v4(),
  court_id uuid not null references courts(id) on delete cascade,
  pricing_mode text not null default 'per_person',
  member_price numeric not null,
  non_member_price numeric not null,
  allowed_player_counts jsonb not null default '[]'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (court_id)
);

create index if not exists pricing_rules_court_id_idx on pricing_rules(court_id);

create trigger update_pricing_rules_updated_at
  before update on pricing_rules
  for each row
  execute function update_updated_at_column();

-- 5) RLS: permitir gestión a super_admin y venue_admin
alter table pricing_rules enable row level security;

create policy "Pricing rules viewable by authenticated users"
  on pricing_rules for select
  to authenticated
  using (true);

create policy "Admins can insert pricing rules"
  on pricing_rules for insert
  to authenticated
  with check (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role in ('super_admin', 'venue_admin')
    )
  );

create policy "Admins can update pricing rules"
  on pricing_rules for update
  to authenticated
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role in ('super_admin', 'venue_admin')
    )
  );

create policy "Admins can delete pricing rules"
  on pricing_rules for delete
  to authenticated
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role in ('super_admin', 'venue_admin')
    )
  );

-- RLS en club_members: ampliar de solo super_admin a venue_admin también
-- (las policies previas solo dejaban super_admin)

drop policy if exists "Only super_admin can insert club members" on club_members;
drop policy if exists "Only super_admin can update club members" on club_members;
drop policy if exists "Only super_admin can delete club members" on club_members;

create policy "Admins can insert club members"
  on club_members for insert
  to authenticated
  with check (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role in ('super_admin', 'venue_admin')
    )
  );

create policy "Admins can update club members"
  on club_members for update
  to authenticated
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role in ('super_admin', 'venue_admin')
    )
  );

create policy "Admins can delete club members"
  on club_members for delete
  to authenticated
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role in ('super_admin', 'venue_admin')
    )
  );
