-- INTENTIONALLY VULNERABLE.
-- This policy exists solely for the RLS Red Alert authorised demo.

create policy "Authenticated trainers can view clients"
on public.clients
for select
to authenticated
using (true);
