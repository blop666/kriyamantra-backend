create table public.products (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  name text not null check (char_length(trim(name)) between 2 and 160),
  description text,
  materials text,
  price numeric(12, 2) check (price is null or price >= 0),
  image_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index products_business_id_created_at_idx on public.products (business_id, created_at desc);
alter table public.products enable row level security;

create policy "owners can read their products" on public.products for select
  using (exists (select 1 from public.businesses where id = business_id and owner_id = auth.uid()));
create policy "owners can create their products" on public.products for insert
  with check (exists (select 1 from public.businesses where id = business_id and owner_id = auth.uid()));
create policy "owners can update their products" on public.products for update
  using (exists (select 1 from public.businesses where id = business_id and owner_id = auth.uid()))
  with check (exists (select 1 from public.businesses where id = business_id and owner_id = auth.uid()));
create policy "owners can delete their products" on public.products for delete
  using (exists (select 1 from public.businesses where id = business_id and owner_id = auth.uid()));

create trigger products_set_updated_at before update on public.products
for each row execute function public.set_updated_at();

insert into storage.buckets (id, name, public) values ('product-images', 'product-images', false)
on conflict (id) do nothing;

create policy "owners can read product images" on storage.objects for select
  using (bucket_id = 'product-images' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "owners can upload product images" on storage.objects for insert
  with check (bucket_id = 'product-images' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "owners can delete product images" on storage.objects for delete
  using (bucket_id = 'product-images' and (storage.foldername(name))[1] = auth.uid()::text);
