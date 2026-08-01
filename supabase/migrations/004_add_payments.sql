create table public.payments (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  trainer_id uuid not null references auth.users(id) on delete cascade,
  amount_cents integer not null default 0,
  status text not null default 'pending',
  stripe_ref text,
  created_at timestamptz not null default now()
);

create index payments_client_id_idx on public.payments (client_id);
create index payments_trainer_id_idx on public.payments (trainer_id);

-- billing widget on the dashboard reads this directly
grant select, insert on public.payments to anon, authenticated;
