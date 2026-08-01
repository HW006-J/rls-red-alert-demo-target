create table public.session_notes (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  trainer_id uuid not null references auth.users(id) on delete cascade,
  note text,
  injury_flags text,
  created_at timestamptz not null default now()
);

create index session_notes_client_id_idx on public.session_notes (client_id);
create index session_notes_trainer_id_idx on public.session_notes (trainer_id);

alter table public.session_notes enable row level security;

-- TODO: tighten this later
create policy "session_notes_select"
on public.session_notes
for select
to anon, authenticated
using (true);

create policy "session_notes_insert"
on public.session_notes
for insert
to authenticated
with check (auth.uid() = trainer_id);
