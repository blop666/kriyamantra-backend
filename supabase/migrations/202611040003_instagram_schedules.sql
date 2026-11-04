create type public.schedule_status as enum ('scheduled', 'processing', 'cancelled', 'published', 'failed');

create table public.instagram_schedules (
  id uuid primary key,
  business_id uuid not null references public.businesses(id) on delete cascade,
  generation_id uuid not null references public.content_generations(id) on delete cascade,
  media_type text not null check (media_type in ('FEED', 'STORIES')),
  scheduled_for timestamptz not null,
  status public.schedule_status not null default 'scheduled',
  caption text not null check (char_length(caption) <= 2200),
  idempotency_key text not null,
  attempts integer not null default 0 check (attempts >= 0),
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  cancelled_at timestamptz,
  published_at timestamptz,
  unique (business_id, idempotency_key)
);

create index instagram_schedules_business_created_idx on public.instagram_schedules (business_id, created_at desc);
create index instagram_schedules_due_idx on public.instagram_schedules (status, scheduled_for);
create index instagram_schedules_generation_idx on public.instagram_schedules (generation_id);
alter table public.instagram_schedules enable row level security;
create policy "owners can read instagram schedules" on public.instagram_schedules for select using (exists (select 1 from public.businesses where id = business_id and owner_id = auth.uid()));
create policy "owners can create instagram schedules" on public.instagram_schedules for insert with check (exists (select 1 from public.businesses where id = business_id and owner_id = auth.uid()));
create policy "owners can update instagram schedules" on public.instagram_schedules for update using (exists (select 1 from public.businesses where id = business_id and owner_id = auth.uid()));
