alter table public.settings
  add column if not exists event_title text default 'Q26 Sessions';

update public.settings
set event_title = 'Q26 Sessions'
where event_title is null or trim(event_title) = '';
