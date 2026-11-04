create unique index if not exists instagram_publish_jobs_generation_media_type_unique
  on public.instagram_publish_jobs (generation_id, media_type);
