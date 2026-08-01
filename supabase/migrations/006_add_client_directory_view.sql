alter table public.clients add column if not exists phone text;

-- flat list for the client picker / autocomplete
-- reads from clients so it picks up the RLS on that table, no extra policy needed here
create view public.client_directory as
select
  id,
  name,
  email,
  phone
from public.clients;

grant select on public.client_directory to anon, authenticated;
