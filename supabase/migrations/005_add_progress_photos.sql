create table public.progress_photos (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  storage_path text not null,
  taken_at timestamptz not null default now()
);

create index progress_photos_client_id_idx on public.progress_photos (client_id);

alter table public.progress_photos enable row level security;

create policy "progress_photos_select_own"
on public.progress_photos
for select
to authenticated
using (
  exists (
    select 1
    from public.clients c
    where c.id = progress_photos.client_id
      and c.trainer_id = auth.uid()
  )
);

create policy "progress_photos_insert_own"
on public.progress_photos
for insert
to authenticated
with check (
  exists (
    select 1
    from public.clients c
    where c.id = progress_photos.client_id
      and c.trainer_id = auth.uid()
  )
);

create policy "progress_photos_delete_own"
on public.progress_photos
for delete
to authenticated
using (
  exists (
    select 1
    from public.clients c
    where c.id = progress_photos.client_id
      and c.trainer_id = auth.uid()
  )
);

-- helper for the gallery component, the policy above was too slow with the join
create or replace function public.get_client_photos(p_client_id uuid)
returns setof public.progress_photos
language sql
security definer
set search_path = public
as $$
  select *
  from public.progress_photos
  where client_id = p_client_id
  order by taken_at desc;
$$;

grant execute on function public.get_client_photos(uuid) to anon, authenticated;
