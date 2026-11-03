create extension if not exists "pgcrypto";

create table public.businesses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(trim(name)) between 2 and 120),
  category text not null check (char_length(trim(category)) between 2 and 120),
  location text,
  story text,
  languages text[] not null default '{id}',
  tone text,
  onboarding_completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_id)
);

create table public.consents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  consent_type text not null check (consent_type = 'ai_data_processing'),
  policy_version text not null,
  granted_at timestamptz not null default now(),
  unique (user_id, consent_type, policy_version)
);

alter table public.businesses enable row level security;
alter table public.consents enable row level security;

create policy "owners can read their business"
  on public.businesses for select
  using (auth.uid() = owner_id);

create policy "owners can create their business"
  on public.businesses for insert
  with check (auth.uid() = owner_id);

create policy "owners can update their business"
  on public.businesses for update
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

create policy "users can read their consents"
  on public.consents for select
  using (auth.uid() = user_id);

create policy "users can create their consents"
  on public.consents for insert
  with check (auth.uid() = user_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger businesses_set_updated_at
before update on public.businesses
for each row execute function public.set_updated_at();
