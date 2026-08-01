import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MAX_PROFILE_ID, MIN_PROFILE_ID } from "@/lib/profiles";
import { trainerDisplayName } from "@/lib/trainer-label";

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const label = trainerDisplayName(user.email);

  return (
    <div className="card">
      <h1>My account</h1>
      <p>
        Signed in as{" "}
        {label ? (
          <>
            <strong>{label}</strong> ({user.email})
          </>
        ) : (
          <strong>{user.email}</strong>
        )}
        .
      </p>
      <p className="muted">
        Visit <code>/profiles/{MIN_PROFILE_ID}</code>, then try changing the
        final number in the browser URL from {MIN_PROFILE_ID} to{" "}
        {MIN_PROFILE_ID + 1}, {MAX_PROFILE_ID - 1} or {MAX_PROFILE_ID}.
      </p>
    </div>
  );
}
