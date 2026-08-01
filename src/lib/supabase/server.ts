import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Server-side client scoped to the signed-in user's own session (anon key +
// user JWT). All app queries go through this client so that Postgres RLS
// policies -- including the deliberately broken one on account_profiles --
// are what decides what comes back, not application code.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component during render; middleware
            // already refreshes the session, so this can be ignored.
          }
        },
      },
    }
  );
}
