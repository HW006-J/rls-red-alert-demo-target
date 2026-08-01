# rls-red-alert-demo-target

> ⚠️ **INTENTIONALLY VULNERABLE SECURITY DEMO.** This is an isolated, public
> hackathon fixture containing a real, deliberately introduced access-control
> vulnerability. It uses only synthetic `*.test` accounts and invented data.
> Do not reuse this code, its Supabase policies, or its patterns in a real
> application.

Deliberately vulnerable Supabase RLS fixture for the RLS Red Alert hackathon
demo. It ships two things:

1. **A minimal Next.js app** (App Router + TypeScript) with Supabase
   authentication, so the vulnerability can be demonstrated end-to-end in a
   browser rather than just described.
2. **Supabase SQL migrations** defining an `account_profiles` table with Row
   Level Security enabled, plus a policy that is broken on purpose.

## The vulnerability

**OWASP Broken Access Control** — specifically **Broken Object Level
Authorization (BOLA)** / **Insecure Direct Object Reference (IDOR)**.

The `account_profiles` table stores one row per demo user, addressed by a
small sequential `public_id`. The app's profile page
(`src/app/profiles/[id]/page.tsx`) queries that table using only the
`public_id` taken from the URL — it does not additionally filter by
`owner_id`. That's a completely ordinary thing to write, and it would be safe
*if* the database enforced ownership. It doesn't: migration
[`004_add_vulnerable_account_profiles_policy.sql`](supabase/migrations/004_add_vulnerable_account_profiles_policy.sql)
grants `SELECT` on the table to any authenticated user with `using (true)`,
instead of scoping rows to `owner_id = auth.uid()`.

The result: any signed-in demo user can page through `/profiles/1` ...
`/profiles/5` and read every other user's `email`, `phone`, and
`private_note` — a live BOLA/IDOR failure, not a simulated one. The leaked
data comes back from a real Postgres query governed by a real RLS policy.

### Try it

1. Run the app (see below) and sign in as **Bob**
   (`bob@rls-red-alert-demo.test`, password `DemoPassw0rd!`).
2. Visit `/profiles/1` — this is Bob's own profile. Authorized.
3. Edit the number in the URL: `/profiles/2`, `/profiles/3`, `/profiles/4`,
   `/profiles/5`. Each one returns another demo user's (Alice, Carol, Dave,
   Erin) private record, despite Bob having no authorization to see it.

### The fix (not applied here, on purpose)

Replace the `using (true)` policy with one that scopes rows to their owner:

```sql
create policy "Users can view only their own account profile"
on public.account_profiles
for select
to authenticated
using (owner_id = auth.uid());
```

## Repository layout

```
src/app/                    Next.js App Router pages
  page.tsx                  Landing page explaining the demo
  login/                    Supabase email/password sign-in
  account/                  "My account" page (safe, owner-scoped query)
  profiles/[id]/            The vulnerable page — queries by URL id only
src/lib/supabase/           Supabase client helpers (browser/server/middleware)
supabase/migrations/        SQL migrations, including the broken RLS policy
scripts/seed.mjs            Seeds synthetic demo accounts (service-role key, local-only)
```

## Local setup

Requires Node.js 20+ and the [Supabase CLI](https://supabase.com/docs/guides/cli).

```bash
npm install
cp .env.example .env.local   # fill in values from the isolated rls-red-alert-demo project
npm run seed                 # creates the 5 synthetic demo accounts (idempotent)
npm run dev
```

Open http://localhost:3000.

### Environment variables

| Variable | Used by | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | app + seed script | Public project URL, safe to expose |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | app | Public anon/publishable key; RLS is the only thing protecting data behind it (which is exactly what this demo breaks) |
| `SUPABASE_SERVICE_ROLE_KEY` | `scripts/seed.mjs` only | Server-only secret. Never referenced from browser code or from any user-facing API route. |

## Safety boundaries

- Isolated `rls-red-alert-demo` Supabase project only — never CoachFlow or
  any other real project.
- Only synthetic `*.test` email addresses, invented names, phone numbers, and
  notes.
- No real API keys, tokens, passwords, or credentials are committed. `.env*`
  files are git-ignored; `.env.example` holds placeholders only.
- The service-role key is used exclusively by the local/CI-only seed script,
  never in the browser bundle or a deployed API route.
- No general-purpose SQL execution endpoint is exposed by the app.
- The vulnerable nature of this app is labeled in the UI (a persistent banner
  on every page) and in this README.
