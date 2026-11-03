alter table public.businesses
  add column if not exists instagram_handle text,
  add column if not exists contact_phone text;
