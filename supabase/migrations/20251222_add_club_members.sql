-- Crear tabla de socios del club
create table club_members (
  id uuid primary key default uuid_generate_v4(),
  member_number text not null unique,
  full_name text not null,
  email text,
  phone text,
  status text not null default 'active',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Agregar columnas a profiles para socios
alter table profiles add column is_member boolean default false;
alter table profiles add column member_number text;
alter table profiles add column member_id uuid references club_members(id);

-- Crear índices
create index club_members_member_number_idx on club_members(member_number);
create index profiles_member_id_idx on profiles(member_id);

-- Trigger para actualizar updated_at
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

create trigger update_club_members_updated_at
  before update on club_members
  for each row
  execute function update_updated_at_column();

-- RLS policies
alter table club_members enable row level security;

create policy "Club members are viewable by authenticated users"
  on club_members for select
  to authenticated
  using (true);

-- Solo super_admin puede modificar socios
create policy "Only super_admin can insert club members"
  on club_members for insert
  to authenticated
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role = 'super_admin'
    )
  );

create policy "Only super_admin can update club members"
  on club_members for update
  to authenticated
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role = 'super_admin'
    )
  );

create policy "Only super_admin can delete club members"
  on club_members for delete
  to authenticated
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role = 'super_admin'
    )
  );
