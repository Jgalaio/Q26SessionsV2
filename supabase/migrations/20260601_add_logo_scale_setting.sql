alter table public.settings
  add column if not exists logo_scale_percent integer default 100;

alter table public.settings
  add column if not exists home_logo_scale_percent integer default 100,
  add column if not exists vote_logo_scale_percent integer default 100,
  add column if not exists poster_logo_scale_percent integer default 100;
