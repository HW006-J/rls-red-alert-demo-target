-- Deliberately simplified schema for an authorised security demonstration.
-- Do not deploy this fixture to a real production application.

create table public.clients (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  email text,
  private_notes text,
  created_at timestamptz not null default now()
);

alter table public.clients enable row level security;
