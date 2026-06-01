alter table public.settings
  add column if not exists home_background_url text,
  add column if not exists vote_background_url text,
  add column if not exists poster_background_url text;
