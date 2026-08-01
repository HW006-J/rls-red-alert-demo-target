import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const publicId = Number(id);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  if (!Number.isInteger(publicId)) {
    return (
      <div className="card">
        <h1>Profile</h1>
        <p className="error-box">&quot;{id}&quot; is not a valid profile id.</p>
      </div>
    );
  }

  // VULNERABLE BY DESIGN: this queries account_profiles using only the
  // public_id taken straight from the URL. There is no `.eq("owner_id",
  // user.id)` check here -- the app relies entirely on the database's Row
  // Level Security policy to enforce that a caller may only read their own
  // row. The demo's RLS policy on this table grants SELECT to any
  // authenticated user (see supabase/migrations/004_...), so this call
  // returns whichever row matches the id in the URL, regardless of who owns
  // it. That gap between "the app assumes RLS protects this" and "the
  // policy doesn't actually scope it" is the Broken Object Level
  // Authorization (BOLA/IDOR) this demo illustrates.
  const { data: profile, error } = await supabase
    .from("account_profiles")
    .select("public_id, owner_id, display_name, email, phone, private_note, created_at")
    .eq("public_id", publicId)
    .maybeSingle();

  const isOwnProfile = profile?.owner_id === user.id;

  return (
    <div className="card">
      <h1>Profile #{publicId}</h1>

      <div className="demo-links">
        {[1, 2, 3, 4, 5].map((linkId) => (
          <Link
            key={linkId}
            href={`/profiles/${linkId}`}
            className={linkId === publicId ? "current" : undefined}
          >
            /profiles/{linkId}
          </Link>
        ))}
      </div>

      {error && <p className="error-box">{error.message}</p>}

      {!error && !profile && (
        <p className="muted" style={{ marginTop: "1rem" }}>
          No profile exists with id {publicId}.
        </p>
      )}

      {profile && (
        <>
          {isOwnProfile ? (
            <span className="badge ok">Your own profile</span>
          ) : (
            <span className="badge leak">
              Not your profile — access control failure
            </span>
          )}

          {!isOwnProfile && (
            <p className="error-box" style={{ marginTop: "1rem" }}>
              You are signed in as <strong>{user.email}</strong>, but the
              server just returned another user&apos;s private record. A
              correctly written policy would have scoped this query to rows
              where <code>owner_id = auth.uid()</code>.
            </p>
          )}

          <dl className="profile-grid">
            <dt>Display name</dt>
            <dd>{profile.display_name}</dd>
            <dt>Email</dt>
            <dd>{profile.email}</dd>
            <dt>Phone</dt>
            <dd>{profile.phone}</dd>
            <dt>Private note</dt>
            <dd>{profile.private_note}</dd>
            <dt>Created</dt>
            <dd>{new Date(profile.created_at).toLocaleString()}</dd>
          </dl>
        </>
      )}
    </div>
  );
}
