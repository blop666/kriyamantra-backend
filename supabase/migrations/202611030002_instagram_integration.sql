create type public.integration_status as enum ('active', 'expired', 'revoked', 'error');
create type public.publish_status as enum ('processing', 'succeeded', 'failed');

create table public.instagram_connections (
  id uuid primary key,
  business_id uuid not null references public.businesses(id) on delete cascade,
  instagram_user_id text not null,
  username text not null,
  account_type text not null,
  access_token_encrypted text not null,
  token_expires_at timestamptz,
  scopes text[] not null default '{}',
  status public.integration_status not null default 'active',
  connected_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (business_id)
);

create table public.instagram_oauth_states (
  id uuid primary key,
  business_id uuid not null references public.businesses(id) on delete cascade,
  state_hash text not null unique,
  expires_at timestamptz not null,
  consumed_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.instagram_publish_jobs (
  id uuid primary key,
  business_id uuid not null references public.businesses(id) on delete cascade,
  connection_id uuid not null references public.instagram_connections(id) on delete cascade,
  generation_id uuid not null references public.content_generations(id) on delete cascade,
  media_type text not null check (media_type in ('FEED', 'STORIES')),
  caption text not null,
  container_id text,
  provider_media_id text,
  status public.publish_status not null,
  provider_error text,
  confirmed_at timestamptz not null,
  published_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.instagram_connections enable row level security;
alter table public.instagram_oauth_states enable row level security;
alter table public.instagram_publish_jobs enable row level security;
create policy "owners can read instagram connections" on public.instagram_connections for select using (exists (select 1 from public.businesses where id = business_id and owner_id = auth.uid()));
create policy "owners can manage instagram connections" on public.instagram_connections for all using (exists (select 1 from public.businesses where id = business_id and owner_id = auth.uid()));
create policy "owners can read instagram publish jobs" on public.instagram_publish_jobs for select using (exists (select 1 from public.businesses where id = business_id and owner_id = auth.uid()));
