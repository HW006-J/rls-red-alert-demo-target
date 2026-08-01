# rls-red-alert-demo-target

> ⚠️ **INTENTIONALLY VULNERABLE SECURITY DEMO.** This is an isolated, public
> hackathon fixture containing real, deliberately introduced access-control
> vulnerabilities. It uses only synthetic accounts and invented data. Do not
> deploy this repository, do not copy any of it, and do not use it as a
> template for a real application.

Deliberately vulnerable Supabase RLS fixture for the RLS Red Alert hackathon
demo. It ships two related but distinct things:

1. **A live, runnable Next.js app** (App Router + TypeScript) with real
   Supabase authentication, demonstrating one specific Broken Access Control
   vulnerability end-to-end in a browser — not just describing it.
2. **A static scan-fixture surface** — a small fake personal-training SaaS
   (trainers, clients, session notes, payments, progress photos) whose
   migrations and config contain a broader, catalogued set of intentional
   RLS and access-policy flaws for a vulnerability scanner to find. The
   expected findings are listed in
   [VULNERABILITIES.md](VULNERABILITIES.md), the answer key for the scanner.
   **This surface is static only** — its config (`.env.example`,
   `src/lib/supabaseClient.ts`) and `supabase/seed.sql` point at a
   non-existent placeholder project and are never installed, run, or applied
   against any real database. Every credential-shaped string in it contains
   the word `EXAMPLE` and is non-functional.

Both the live app and the static fixture share the same
`supabase/migrations/001_create_clients.sql` and
`002_add_vulnerable_clients_policy.sql`, and are driven by
[Vibe Fixer](https://github.com/HW006-J/rls-red-alert) — a companion tool
that statically scans this repository, live-validates the live app's
vulnerability against the same isolated Supabase project, and can apply/reset
a trusted repair to the `002` policy. Both tools operate on the same
`public.clients` table, the same `trainer_id` ownership column, and the same
two synthetic trainer accounts, so a repair Vibe Fixer reports as applied
actually closes the hole the live app exposes.

There is no real data and there are no real secrets anywhere in this
repository. Every person, email address, and phone number is invented.

## The live app's vulnerability

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
src/app/                    Next.js App Router pages (live demo)
  page.tsx                  Landing page explaining the demo
  login/                    Supabase email/password sign-in
  account/                  "My account" page, links to all 4 profile URLs
  profiles/[id]/            The vulnerable page — queries by position only
src/lib/supabase/           Supabase client helpers (browser/server/middleware)
src/lib/profiles.ts         Pure helpers: id validation, owned/foreign derivation
src/lib/supabaseClient.ts   Static scan-fixture client (unused by the live app)
supabase/migrations/        SQL migrations
  001, 002                    Shared by the live app and the static fixture
  003-007                     Static scan-fixture surface only (see VULNERABILITIES.md)
supabase/seed.sql           Static scan-fixture seed data (never applied live)
firebase.rules              Static scan-fixture: legacy push-notification rules
VULNERABILITIES.md          Answer key — expected static-scanner findings
```

## Local setup

Requires Node.js 20+.

```bash
npm install
cp .env.example .env.local   # fill in the NEXT_PUBLIC_SUPABASE_* values from the isolated rls-red-alert-demo project
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
own — see "Data ownership" below. The remaining variables in `.env.example`
(`VITE_SUPABASE_*`, `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`) belong
to the static scan-fixture surface, not this app — see
[VULNERABILITIES.md](VULNERABILITIES.md).

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
- `supabase/migrations/003-007`, `supabase/seed.sql`,
  `src/lib/supabaseClient.ts`, and `firebase.rules` belong to the static
  scan-fixture surface described in [VULNERABILITIES.md](VULNERABILITIES.md).
  They are not wired into the live Next.js app and are not applied against
  any real database.

## Safety boundaries

- Isolated `rls-red-alert-demo` Supabase project only — never CoachFlow or
  any other real project.
- Only synthetic accounts and invented data throughout the shared
  environment; nothing in this repository is or has ever been connected to
  a live project outside the isolated demo.
- No real API keys, tokens, passwords, or credentials are committed. `.env*`
  files are git-ignored; `.env.example` holds placeholders only, and every
  credential-shaped string in it contains the word `EXAMPLE`.
- This app never references a service-role key, in the browser bundle or
  otherwise.
- No general-purpose SQL execution endpoint is exposed by the app.
- The vulnerable nature of this repository is labeled in the UI (a
  persistent banner on every page of the live app) and in this README.
- **If you found this repo looking for a starting point for your own app:
  none of this SQL, config, or code is safe to reuse.**
