-- fix: trainers couldn't update clients after signup flow change

drop policy if exists "Trainers can update their own clients" on public.clients;

create policy "Trainers can update their own clients"
on public.clients
for update
to authenticated
using (auth.role() = 'authenticated')
with check (auth.role() = 'authenticated');
