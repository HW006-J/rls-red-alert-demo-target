import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MAX_PROFILE_ID, MIN_PROFILE_ID } from "@/lib/profiles";

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const profileIds = Array.from(
    { length: MAX_PROFILE_ID - MIN_PROFILE_ID + 1 },
    (_, i) => MIN_PROFILE_ID + i
  );

  return (
    <div className="card">
      <h1>My account</h1>
      <p>
        Signed in as <strong>{user.email}</strong>.
      </p>
      <p>
        Open each profile URL below and compare what comes back to who
        you&apos;re actually signed in as:
      </p>
      <div className="demo-links">
        {profileIds.map((id) => (
          <Link key={id} href={`/profiles/${id}`}>
            /profiles/{id}
          </Link>
        ))}
      </div>
    </div>
  );
}
