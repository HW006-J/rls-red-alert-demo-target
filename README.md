# rls-red-alert-demo-target

Deliberately vulnerable Supabase RLS fixture for the RLS Red Alert hackathon demo.

## ⚠️ Read this first

**This repository is deliberately insecure. Do not deploy it, do not copy any of it, and do not use it as a template.**

It exists for exactly one reason: to be the scan target for RLS Red Alert. It is a small,
fake personal-training SaaS (trainers, clients, session notes, payments, progress photos)
whose migrations and config contain a known, catalogued set of Row Level Security and
access-policy flaws — permissive policies, a table with RLS never enabled, a
`security definer` function that bypasses its own table's policies, a view that leaks past
RLS, hardcoded credentials, and world-writable Firebase rules. Every one of those is
intentional. The expected findings are listed in [VULNERABILITIES.md](VULNERABILITIES.md),
which is the answer key for the scanner.

There is no real data and there are no real secrets here. Every person, email address and
phone number is invented, and every credential-shaped string is a non-functional
placeholder containing the word `EXAMPLE`. Nothing in this repository is or has ever been
connected to a live project.

**If you found this repo looking for a starting point for your own app: none of this SQL is
safe to reuse.**

## Layout

| Path | What it is |
|------|-----------|
| `supabase/migrations/` | Schema and RLS policies — the primary scan surface |
| `supabase/seed.sql` | Two fake trainers, three fake clients each |
| `src/lib/supabaseClient.ts` | Frontend client fixture |
| `firebase.rules` | Legacy push-notification rules fixture |
| `.env.example` | Placeholder secrets fixture |
| `VULNERABILITIES.md` | Answer key — expected scanner findings |
