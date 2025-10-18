-- Step 9: Push tokens table and RLS
-- Create table
create table if not exists public.push_tokens (
  user_id uuid not null references auth.users(id) on delete cascade,
  token text not null,
  device_type text not null default 'web',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint push_tokens_pkey primary key (token)
);

-- Ensure updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists trg_push_tokens_updated_at on public.push_tokens;
create trigger trg_push_tokens_updated_at
before update on public.push_tokens
for each row execute function public.set_updated_at();

-- RLS
alter table public.push_tokens enable row level security;

drop policy if exists "select own tokens" on public.push_tokens;
drop policy if exists "insert own tokens" on public.push_tokens;
drop policy if exists "update own tokens" on public.push_tokens;
drop policy if exists "delete own tokens" on public.push_tokens;

create policy "select own tokens" on public.push_tokens
for select using (auth.uid() = user_id);

create policy "insert own tokens" on public.push_tokens
for insert with check (auth.uid() = user_id);

create policy "update own tokens" on public.push_tokens
for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "delete own tokens" on public.push_tokens
for delete using (auth.uid() = user_id);
