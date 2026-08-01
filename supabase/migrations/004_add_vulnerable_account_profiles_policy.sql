-- INTENTIONALLY VULNERABLE.
-- This policy exists solely for the RLS Red Alert authorised demo.
--
-- It grants every authenticated user SELECT access to every row in
-- account_profiles, instead of scoping rows to `owner_id = auth.uid()`.
-- The application queries this table by the client-supplied `public_id`
-- path segment (/profiles/[id]), so this policy is what turns that
-- ordinary-looking route into a real Broken Object Level Authorization
-- (BOLA) / Insecure Direct Object Reference (IDOR) vulnerability: any
-- signed-in demo user can page through public_id values and read every
-- other user's private_note, email, and phone.

create policy "Authenticated users can view any account profile"
on public.account_profiles
for select
to authenticated
using (true);
