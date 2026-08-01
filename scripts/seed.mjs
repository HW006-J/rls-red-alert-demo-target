// Seeds the isolated `rls-red-alert-demo` Supabase project with synthetic
// demo accounts for the Broken Access Control (BOLA/IDOR) walkthrough.
//
// This script is the ONLY place in the codebase that uses the Supabase
// service-role key. It runs locally/in CI, never in the browser or in a
// deployed API route, and creates only invented `*.test` identities.
//
// Usage:
//   cp .env.example .env.local   # fill in real values from the Supabase project
//   npm run seed

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Copy .env.example to .env.local and fill it in first."
  );
  process.exit(1);
}

if (!SUPABASE_URL.includes("mcmtazachjcyoimujvpt")) {
  console.error(
    `Refusing to seed: NEXT_PUBLIC_SUPABASE_URL (${SUPABASE_URL}) does not look like the isolated rls-red-alert-demo project. ` +
      "This script must never run against CoachFlow or any other Supabase project."
  );
  process.exit(1);
}

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const DEMO_PASSWORD = "DemoPassw0rd!";

// public_id order matters: it drives the /profiles/1 .. /profiles/5 walkthrough.
const DEMO_USERS = [
  {
    publicId: 1,
    displayName: "Bob Ashworth",
    email: "bob@rls-red-alert-demo.test",
    phone: "+1-555-0101",
    privateNote: "Bob's private note: reminder to renew synthetic gym pass.",
  },
  {
    publicId: 2,
    displayName: "Alice Nakamura",
    email: "alice@rls-red-alert-demo.test",
    phone: "+1-555-0102",
    privateNote: "Alice's private note: synthetic therapy session on Tuesdays.",
  },
  {
    publicId: 3,
    displayName: "Carol Jimenez",
    email: "carol@rls-red-alert-demo.test",
    phone: "+1-555-0103",
    privateNote: "Carol's private note: synthetic savings goal is $4,200.",
  },
  {
    publicId: 4,
    displayName: "Dave Okafor",
    email: "dave@rls-red-alert-demo.test",
    phone: "+1-555-0104",
    privateNote: "Dave's private note: synthetic medical follow-up next month.",
  },
  {
    publicId: 5,
    displayName: "Erin Kowalski",
    email: "erin@rls-red-alert-demo.test",
    phone: "+1-555-0105",
    privateNote: "Erin's private note: synthetic salary negotiation notes.",
  },
];

async function findExistingUserByEmail(email) {
  // admin.listUsers doesn't support filtering by email directly, so page
  // through results. The demo user set is tiny, so a single page suffices.
  const { data, error } = await admin.auth.admin.listUsers({
    page: 1,
    perPage: 200,
  });
  if (error) throw error;
  return data.users.find((u) => u.email === email) ?? null;
}

async function ensureAuthUser({ email }) {
  const existing = await findExistingUserByEmail(email);
  if (existing) {
    console.log(`  auth user already exists: ${email}`);
    return existing;
  }

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password: DEMO_PASSWORD,
    email_confirm: true,
  });
  if (error) throw error;
  console.log(`  created auth user: ${email}`);
  return data.user;
}

async function ensureProfile(user, demoUser) {
  const { error } = await admin
    .from("account_profiles")
    .upsert(
      {
        public_id: demoUser.publicId,
        owner_id: user.id,
        display_name: demoUser.displayName,
        email: demoUser.email,
        phone: demoUser.phone,
        private_note: demoUser.privateNote,
      },
      { onConflict: "public_id" }
    );
  if (error) throw error;
  console.log(`  upserted account_profiles row public_id=${demoUser.publicId}`);
}

async function main() {
  console.log(`Seeding ${SUPABASE_URL} with synthetic demo accounts...\n`);
  for (const demoUser of DEMO_USERS) {
    console.log(`${demoUser.displayName} <${demoUser.email}>`);
    const user = await ensureAuthUser(demoUser);
    await ensureProfile(user, demoUser);
  }
  console.log("\nDone. Shared demo password:", DEMO_PASSWORD);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
