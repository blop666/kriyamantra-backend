create table if not exists public.audit_events (
  id uuid primary key,
  business_id uuid not null references public.businesses(id) on delete cascade,
  actor_user_id uuid,
  action text not null,
  entity_type text not null,
  entity_id text,
  request_id text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists audit_events_business_created_idx
  on public.audit_events (business_id, created_at desc);

alter table public.audit_events enable row level security;

create policy "owners can read audit events"
  on public.audit_events for select
  using (exists (select 1 from public.businesses where id = business_id and owner_id = auth.uid()));

create policy "owners can create audit events"
  on public.audit_events for insert
  with check (exists (select 1 from public.businesses where id = business_id and owner_id = auth.uid()));
