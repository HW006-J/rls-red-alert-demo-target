-- Fake demo data only. Every person, email and phone number below is invented.
-- Phone numbers use the Ofcom reserved drama range (+44 7700 900xxx).

insert into auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
)
values
  (
    '11111111-1111-4111-8111-111111111111',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'trainer.one@example.com',
    'EXAMPLE_NOT_A_REAL_PASSWORD_HASH',
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Alex Trainer"}',
    now(),
    now()
  ),
  (
    '22222222-2222-4222-8222-222222222222',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'trainer.two@example.com',
    'EXAMPLE_NOT_A_REAL_PASSWORD_HASH',
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Sam Trainer"}',
    now(),
    now()
  )
on conflict (id) do nothing;

insert into public.clients (id, trainer_id, name, email, phone, private_notes)
values
  ('aaaaaaa1-0000-4000-8000-000000000001', '11111111-1111-4111-8111-111111111111', 'Jane Doe',    'jane@example.com',    '+44 7700 900000', 'Recovering from knee surgery, no jumping.'),
  ('aaaaaaa1-0000-4000-8000-000000000002', '11111111-1111-4111-8111-111111111111', 'John Doe',    'john@example.com',    '+44 7700 900001', 'Asthma, keeps inhaler in gym bag.'),
  ('aaaaaaa1-0000-4000-8000-000000000003', '11111111-1111-4111-8111-111111111111', 'Ada Example', 'ada@example.com',     '+44 7700 900002', 'Training for first 10k.'),
  ('bbbbbbb2-0000-4000-8000-000000000001', '22222222-2222-4222-8222-222222222222', 'Ravi Sample', 'ravi@example.com',    '+44 7700 900003', 'Lower back pain, avoid deadlifts.'),
  ('bbbbbbb2-0000-4000-8000-000000000002', '22222222-2222-4222-8222-222222222222', 'Mia Fixture', 'mia@example.com',     '+44 7700 900004', 'Post-natal, cleared by GP in March.'),
  ('bbbbbbb2-0000-4000-8000-000000000003', '22222222-2222-4222-8222-222222222222', 'Leo Placeholder', 'leo@example.com', '+44 7700 900005', 'Type 1 diabetes, checks levels mid-session.')
on conflict (id) do nothing;

insert into public.session_notes (client_id, trainer_id, note, injury_flags)
values
  ('aaaaaaa1-0000-4000-8000-000000000001', '11111111-1111-4111-8111-111111111111', 'Upper body only. Reported swelling after Tuesday.', 'knee'),
  ('bbbbbbb2-0000-4000-8000-000000000001', '22222222-2222-4222-8222-222222222222', 'Skipped deadlifts, substituted hip thrusts.',       'lower-back'),
  ('bbbbbbb2-0000-4000-8000-000000000003', '22222222-2222-4222-8222-222222222222', 'Blood sugar dipped at 40 mins, stopped early.',     'diabetes');

insert into public.payments (client_id, trainer_id, amount_cents, status, stripe_ref)
values
  ('aaaaaaa1-0000-4000-8000-000000000001', '11111111-1111-4111-8111-111111111111', 4500, 'paid',    'pi_EXAMPLE_NOT_A_REAL_REF_0001'),
  ('bbbbbbb2-0000-4000-8000-000000000002', '22222222-2222-4222-8222-222222222222', 6000, 'pending', 'pi_EXAMPLE_NOT_A_REAL_REF_0002');

insert into public.progress_photos (client_id, storage_path)
values
  ('aaaaaaa1-0000-4000-8000-000000000003', 'progress/aaaaaaa1/2026-01-week1.jpg'),
  ('bbbbbbb2-0000-4000-8000-000000000002', 'progress/bbbbbbb2/2026-01-week1.jpg');
