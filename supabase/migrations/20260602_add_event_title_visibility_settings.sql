alter table public.settings
  add column if not exists show_event_title_home boolean default true,
  add column if not exists show_event_title_live boolean default true,
  add column if not exists show_event_title_poster boolean default true,
  add column if not exists show_event_title_print boolean default true;

update public.settings
set
  show_event_title_home = coalesce(show_event_title_home, true),
  show_event_title_live = coalesce(show_event_title_live, true),
  show_event_title_poster = coalesce(show_event_title_poster, true),
  show_event_title_print = coalesce(show_event_title_print, true);
