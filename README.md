# rls-red-alert-demo-target

> ⚠️ **INTENTIONALLY VULNERABLE SECURITY DEMO.** This is an isolated, public
> hackathon fixture containing a real, deliberately introduced access-control
> vulnerability. It uses only synthetic accounts and invented data. Do not
> reuse this code, its Supabase policies, or its patterns in a real
> application.

Deliberately vulnerable Supabase RLS fixture for the RLS Red Alert hackathon
demo. It ships two things:

1. **A minimal Next.js app** (App Router + TypeScript) with Supabase
   authentication, so the vulnerability can be demonstrated end-to-end in a
   browser rather than just described.
2. **Supabase SQL migrations** defining a `clients` table with Row Level
   Security enabled, plus a policy that is broken on purpose.

This app and its database schema are shared with, and driven by,
[Vibe Fixer](https://github.com/HW006-J/rls-red-alert) — a companion tool
that statically scans this repository, live-validates the vulnerability
against the same Supabase project, and can apply/reset a trusted repair to
the exact policy described below. Both tools operate on the same
`public.clients` table, the same `trainer_id` ownership column, and the same
two synthetic trainer accounts, so a repair Vibe Fixer reports as applied
actually closes the hole this app exposes.

## The vulnerability

**OWASP Broken Access Control** — specifically **Broken Object Level
Authorization (BOLA)** / **Insecure Direct Object Reference (IDOR)**.

The `clients` table stores client records owned by one of two synthetic
"trainer" accounts (Trainer A, presented in this app's UI as **Bob**, and
Trainer B). The app's profile page
(`src/app/profiles/[id]/page.tsx`) asks Postgres for "whichever client row
is at position N" (`/profiles/1` .. `/profiles/4`), ordered deterministically
by `(created_at, id)` — it does not filter by `trainer_id` at all. That's a
completely ordinary thing to write, and it would be safe *if* the database
enforced ownership. It doesn't: migration
[`002_add_vulnerable_clients_policy.sql`](supabase/migrations/002_add_vulnerable_clients_policy.sql)
grants `SELECT` on the table to any authenticated user with `using (true)`,
instead of scoping rows to `trainer_id = auth.uid()`.

The result: Bob (Trainer A) can page through `/profiles/1` .. `/profiles/4`
and read every client record in the table, including the two that belong to
Trainer B — a live BOLA/IDOR failure, not a simulated one. The leaked data
comes back from a real Postgres query governed by a real RLS policy, and
which two profile URLs are "his" versus "leaked" is decided at request time
by comparing the row actually returned to Bob's real `auth.uid()` — nothing
in this app hardcodes which index belongs to which trainer.

### Try it

1. Run the app (see below) and sign in as **Bob** using the Trainer A demo
   credentials provisioned by the Vibe Fixer environment.
2. Visit `/profiles/1` — one of Bob's own clients. Authorized.
3. Edit the number in the URL through `/profiles/4`. Two of the four URLs
   return Trainer B's client records and are flagged **BROKEN ACCESS CONTROL
   CONFIRMED**, despite Bob having no authorization to see them.

### The fix (not applied here, on purpose)

Replace the `using (true)` policy with one that scopes rows to their owner —
this is exactly the trusted repair Vibe Fixer applies:

```sql
create policy "Authenticated trainers can view clients"
on public.clients
for select
to authenticated
using (auth.uid() = trainer_id);
```

Once applied, the same query in `/profiles/[id]/page.tsx` only ever sees
Bob's own rows: his two profile URLs keep working, and the two that used to
leak Trainer B's data become inaccessible (no row exists at that position in
what RLS lets Bob see).

## Repository layout

```
src/app/                    Next.js App Router pages
  page.tsx                  Landing page explaining the demo
  login/                    Supabase email/password sign-in
  account/                  "My account" page, links to all 4 profile URLs
  profiles/[id]/            The vulnerable page — queries by position only
src/lib/supabase/           Supabase client helpers (browser/server/middleware)
src/lib/profiles.ts         Pure helpers: id validation, owned/foreign derivation
supabase/migrations/        SQL migrations, including the broken RLS policy
                             (owned jointly with the Vibe Fixer pipeline —
                             see "Data ownership" below)
```

## Local setup

Requires Node.js 20+.

```bash
npm install
cp .env.example .env.local   # fill in values from the isolated rls-red-alert-demo project
npm run dev
```

Open http://localhost:3000. The demo's `clients` table, RLS policy, and the
two trainer accounts are provisioned by the separate Vibe Fixer repository's
`scripts/setup-demo-environment.mjs`, not by this repository — this app only
reads from them.

### Environment variables

| Variable | Notes |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Public project URL, safe to expose |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anon/publishable key; RLS is the only thing protecting data behind it (which is exactly what this demo breaks) |

This app never uses a service-role key and has no admin/seeding script of its
own — see "Data ownership" below.

## Data ownership

- `supabase/migrations/001_create_clients.sql` and
  `002_add_vulnerable_clients_policy.sql` define the shared `clients` table
  and its deliberately broken policy. They are the source of truth this app
  and Vibe Fixer both depend on and are not modified by this app.
- The two trainer accounts and the four seed client rows are created and
  owned by Vibe Fixer's `scripts/setup-demo-environment.mjs`, which is the
  only place a service-role key is used for this environment.
- This app performs no schema or policy mutation, no seeding, and holds no
  service-role key.

## Safety boundaries

- Isolated `rls-red-alert-demo` Supabase project only — never CoachFlow or
  any other real project.
- Only synthetic accounts and invented data throughout the shared
  environment.
- No real API keys, tokens, passwords, or credentials are committed. `.env*`
  files are git-ignored; `.env.example` holds placeholders only.
- This app never references a service-role key, in the browser bundle or
  otherwise.
- No general-purpose SQL execution endpoint is exposed by the app.
- The vulnerable nature of this app is labeled in the UI (a persistent banner
  on every page) and in this README.
