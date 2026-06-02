alter table public.settings
  add column if not exists home_subtitle_mode text default 'text',
  add column if not exists home_subtitle_image_url text,
  add column if not exists home_subtitle_image_scale_percent integer default 100;

update public.settings
set
  home_subtitle_mode = coalesce(home_subtitle_mode, 'text'),
  home_subtitle_image_scale_percent = coalesce(home_subtitle_image_scale_percent, 100);
