alter table public.settings
  add column if not exists logo_scale_percent integer default 100;
