# VULNERABILITIES.md — ANSWER KEY

> **This file is the expected-results fixture for the RLS Red Alert demo.**
> Every flaw in this repository was planted deliberately. The scanner is expected to
> find exactly the eight findings below: **4 CRITICAL, 2 HIGH, 2 MEDIUM**.
> Do not read this file before a blind scan run — it gives away the answers.

## Expected findings

| # | File | Flaw | Severity | Human impact |
|---|------|------|----------|--------------|
| 1 | `supabase/migrations/003_add_session_notes.sql` | RLS is enabled, but the SELECT policy is `using (true)` and granted to `anon` — the dashboard shows green while every row is world-readable | CRITICAL | Anyone on the internet can read every client's injury flags and session notes. |
| 2 | `supabase/migrations/004_add_payments.sql` | `alter table ... enable row level security` is never called, and `select, insert` is granted to `anon, authenticated` | CRITICAL | Anyone can read every trainer's payment history and insert forged payment rows. |
| 3 | `src/lib/supabaseClient.ts` + `.env.example` | Supabase URL and anon key hardcoded as string literals instead of read from env; `.env.example` carries a committed service-role key and a Stripe secret | CRITICAL | Committed keys leak with the repo; a real service-role key would bypass RLS entirely. |
| 4 | `firebase.rules` | Legacy push-notification project has `".read": true, ".write": true` at the root; the nested `push_tokens/$uid` rule looks scoped but only checks `auth !== null` and is overridden by the root rule anyway | CRITICAL | Any client can read or wipe the entire Firebase database, including all push tokens. |
| 5 | `supabase/migrations/005_add_progress_photos.sql` | The table's RLS policies are correct and properly scoped, but `get_client_photos(p_client_id uuid)` is `security definer` with no `auth.uid()` check and `execute` granted to `anon` | HIGH | The function bypasses the table's own RLS: anyone who guesses a client id gets that client's progress photos. |
| 6 | `supabase/migrations/007_widen_clients_update.sql` | UPDATE policy on `clients` drops the ownership test and uses `using (auth.role() = 'authenticated')` | HIGH | Any signed-in trainer can edit — or corrupt — any other trainer's client records. |
| 7 | `supabase/migrations/006_add_client_directory_view.sql` | View `client_directory` selects name, email and phone from `clients` and is granted to `anon`; the view does not inherit the base table's RLS the way the comment assumes | MEDIUM | Names, emails and phone numbers of every client are readable without authentication. |
| 8 | `package.json` | Deprecated and outdated dependencies: `request` (deprecated 2020), `moment` (maintenance mode), `jsonwebtoken` pre-9 (signature-verification issues), `node-fetch` 2.x | MEDIUM | Known-vulnerable transitive surface; the old `jsonwebtoken` weakens token verification. |

## Pre-existing (not counted in the eight above)

`supabase/migrations/002_add_vulnerable_clients_policy.sql` contains the original
cross-tenant SELECT leak on `clients` (`using (true)` for `authenticated`). This is the
flaw the live demo drives — trainer A querying `clients` sees trainer B's rows. It ships
with the fixture and must not be changed.

## Notes for the demo

- `supabase/seed.sql` creates two trainers with three fake clients each, so a live query
  visibly returns another trainer's rows.
- Finding 5 is the one that proves the scanner reasons about data flow rather than
  keyword-matching: the table looks correctly locked down, and the hole is the function.
- Finding 4 is a second policy language on screen — the tool should reason about access
  policy generally, not only Postgres RLS.
