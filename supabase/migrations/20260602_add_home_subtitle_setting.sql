alter table public.settings
  add column if not exists home_subtitle text default 'Vota no teu DJ favorito';

update public.settings
set home_subtitle = 'Vota no teu DJ favorito'
where home_subtitle is null or trim(home_subtitle) = '';
