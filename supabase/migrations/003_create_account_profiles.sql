-- Deliberately simplified schema for an authorised security demonstration.
-- Do not deploy this fixture to a real production application.
--
-- account_profiles backs the Broken Access Control / BOLA / IDOR walkthrough:
-- each authenticated demo user owns exactly one row, addressed in the app by
-- the small sequential `public_id` shown in the URL (/profiles/1, /profiles/2, ...).

create table public.account_profiles (
  id uuid primary key default gen_random_uuid(),
  public_id integer unique not null,
  owner_id uuid not null references auth.users(id) on delete cascade,
  display_name text not null,
  email text not null,
  phone text not null,
  private_note text not null,
  created_at timestamptz not null default now()
);

alter table public.account_profiles enable row level security;
