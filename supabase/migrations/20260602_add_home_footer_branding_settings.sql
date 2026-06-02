alter table public.settings
  add column if not exists home_footer_logo_url text,
  add column if not exists home_footer_logo_scale_percent integer default 100,
  add column if not exists home_footer_disclaimer_text text default '',
  add column if not exists show_home_footer_disclaimer boolean default false;

update public.settings
set
  home_footer_logo_scale_percent = coalesce(home_footer_logo_scale_percent, 100),
  home_footer_disclaimer_text = coalesce(home_footer_disclaimer_text, ''),
  show_home_footer_disclaimer = coalesce(show_home_footer_disclaimer, false);
