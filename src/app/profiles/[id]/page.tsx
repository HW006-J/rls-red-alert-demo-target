import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  MAX_PROFILE_ID,
  MIN_PROFILE_ID,
  deriveAccessStatus,
  parseProfileId,
  type ClientRow,
} from "@/lib/profiles";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const publicId = parseProfileId(id);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  if (publicId === null) {
    return (
      <div className="card">
        <h1>Profile</h1>
        <p className="error-box">
          &quot;{id}&quot; is not a valid profile id (expected {MIN_PROFILE_ID}-
          {MAX_PROFILE_ID}).
        </p>
      </div>
    );
  }

  // VULNERABLE BY DESIGN. Row Level Security is the only thing standing
  // between "the row at this position" and "a row this caller is allowed
  // to see" -- the query below does nothing to enforce ownership itself:
  //
  //   - No `.eq("trainer_id", user.id)` filter (step 3: intentionally
  //     omitted).
  //   - `.range(offset, offset)` asks Postgres for "whichever row is at
  //     this position among the rows RLS currently lets this session
  //     see", ordered deterministically by (created_at, id). It does not
  //     ask for "row belonging to a specific trainer".
  //
  // The demo's live RLS policy on public.clients (see
  // supabase/migrations/002_add_vulnerable_clients_policy.sql, owned by
  // the RLS Red Alert / Vibe Fixer pipeline that also seeds this table)
  // grants SELECT to any authenticated user with `using (true)`, so this
  // query currently returns all 4 rows regardless of who is asking --
  // both trainers' own rows, position-independent of ownership. Once that
  // policy is repaired to `using (auth.uid() = trainer_id)`, the exact
  // same query only ever sees the caller's own rows, and out-of-range
  // positions simply return nothing. This page never hardcodes which
  // index belongs to which trainer -- ownership is decided below by
  // comparing whatever row came back to the caller's real session.
  const offset = publicId - 1;
  const { data, error } = await supabase
    .from("clients")
    .select("id, trainer_id, name, email, private_notes, created_at")
    .order("created_at", { ascending: true })
    .order("id", { ascending: true })
    .range(offset, offset);

  const row = (data?.[0] as ClientRow | undefined) ?? null;
  const status = row ? deriveAccessStatus(row, user.id) : null;

  return (
    <div className="card">
      <h1>Profile #{publicId}</h1>

      <div className="demo-links">
        {Array.from(
          { length: MAX_PROFILE_ID - MIN_PROFILE_ID + 1 },
          (_, i) => MIN_PROFILE_ID + i
        ).map((linkId) => (
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

      {!error && !row && (
        <p className="muted" style={{ marginTop: "1rem" }}>
          No client record is accessible at position {publicId} for your
          current session. Under the repaired policy this is the expected
          result for a position that used to hold another trainer&apos;s row.
        </p>
      )}

      {row && status && (
        <>
          {status === "owned" ? (
            <span className="badge ok">Authorized — your own client</span>
          ) : (
            <span className="badge leak">BROKEN ACCESS CONTROL CONFIRMED</span>
          )}

          {status === "foreign" && (
            <p className="error-box" style={{ marginTop: "1rem" }}>
              You are signed in as <strong>{user.email}</strong>, but the
              server just returned another trainer&apos;s client record. A
              correctly written policy would have scoped this query to rows
              where <code>trainer_id = auth.uid()</code>.
            </p>
          )}

          <dl className="profile-grid">
            <dt>Client name</dt>
            <dd>{row.name}</dd>
            <dt>Email</dt>
            <dd>{row.email ?? "—"}</dd>
            <dt>Private notes</dt>
            <dd>{row.private_notes ?? "—"}</dd>
            <dt>Created</dt>
            <dd>{new Date(row.created_at).toLocaleString()}</dd>
          </dl>
        </>
      )}
    </div>
  );
}
