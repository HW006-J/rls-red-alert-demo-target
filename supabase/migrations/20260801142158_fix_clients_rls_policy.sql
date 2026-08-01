-- Fix: restrict public.clients to the trainer who owns each row.
--
-- Found by RLS Red Alert and confirmed against a live database: the policy
-- "Authenticated trainers can view clients" used USING (true), so every authenticated
-- trainer could read every other trainer's clients.
--
-- This replaces it with an ownership check against trainer_id,
-- so a trainer sees their own rows and nothing else.

drop policy if exists "Authenticated trainers can view clients" on public.clients;
create policy "Authenticated trainers can view clients" on public.clients for select to authenticated using (auth.uid() = trainer_id);
