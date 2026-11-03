create type public.generation_status as enum ('queued', 'processing', 'succeeded', 'failed');
create type public.content_format as enum ('feed', 'story');
create type public.quality_status as enum ('draft', 'approved');
create type public.image_job_status as enum ('queued', 'processing', 'succeeded', 'failed');

create table public.content_generations (
  id uuid primary key default gen_random_uuid(), business_id uuid not null references public.businesses(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade, conversation_id uuid not null references public.conversations(id) on delete cascade,
  status public.generation_status not null default 'queued', format public.content_format not null,
  request_payload jsonb not null, error_message text, created_at timestamptz not null default now(), completed_at timestamptz,
  image_status public.image_job_status, image_job_id text, image_error text
);
create table public.content_outputs (
  id uuid primary key default gen_random_uuid(), generation_id uuid not null references public.content_generations(id) on delete cascade,
  version integer not null check (version > 0), image_path text, caption_id text not null, caption_en text not null,
  hashtags jsonb not null, creative_brief jsonb not null, quality_status public.quality_status not null default 'draft',
  is_selected boolean not null default false, created_at timestamptz not null default now(), unique (generation_id, version)
);
create index content_generations_business_created_idx on public.content_generations (business_id, created_at desc);
insert into storage.buckets (id, name, public) values ('generated-images', 'generated-images', false) on conflict (id) do nothing;
alter table public.content_generations enable row level security;
alter table public.content_outputs enable row level security;
create policy "owners can read their generations" on public.content_generations for select using (exists (select 1 from public.businesses where id = business_id and owner_id = auth.uid()));
create policy "owners can create their generations" on public.content_generations for insert with check (exists (select 1 from public.businesses where id = business_id and owner_id = auth.uid()));
create policy "owners can update their generations" on public.content_generations for update using (exists (select 1 from public.businesses where id = business_id and owner_id = auth.uid()));
create policy "owners can read their outputs" on public.content_outputs for select using (exists (select 1 from public.content_generations g join public.businesses b on b.id = g.business_id where g.id = generation_id and b.owner_id = auth.uid()));
create policy "owners can create their outputs" on public.content_outputs for insert with check (exists (select 1 from public.content_generations g join public.businesses b on b.id = g.business_id where g.id = generation_id and b.owner_id = auth.uid()));
create policy "owners can read generated images" on storage.objects for select using (bucket_id = 'generated-images' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "owners can create generated images" on storage.objects for insert with check (bucket_id = 'generated-images' and (storage.foldername(name))[1] = auth.uid()::text);
