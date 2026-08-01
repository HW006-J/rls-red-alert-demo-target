import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // A "legitimate" lookup: this page scopes the query to the caller's own
  // row via owner_id, so it stays correct regardless of what the RLS policy
  // allows. Contrast this with /profiles/[id], which trusts the id in the
  // URL and relies entirely on RLS to enforce ownership -- which is exactly
  // what this demo's broken policy fails to do.
  const { data: profile } = await supabase
    .from("account_profiles")
    .select("public_id, display_name, email")
    .eq("owner_id", user.id)
    .maybeSingle();

  return (
    <div className="card">
      <h1>My account</h1>
      <p>
        Signed in as <strong>{user.email}</strong>.
      </p>

      {profile ? (
        <>
          <p>
            Your profile lives at{" "}
            <Link href={`/profiles/${profile.public_id}`}>
              /profiles/{profile.public_id}
            </Link>
            . Open it, then try editing the number in the address bar to see
            the access-control failure for yourself.
          </p>
          <div className="demo-links">
            {[1, 2, 3, 4, 5].map((id) => (
              <Link key={id} href={`/profiles/${id}`}>
                /profiles/{id}
              </Link>
            ))}
          </div>
        </>
      ) : (
        <p className="muted">
          No demo profile is linked to this account yet.
        </p>
      )}
    </div>
  );
}
