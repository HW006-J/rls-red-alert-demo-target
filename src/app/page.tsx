import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { MAX_PROFILE_ID, MIN_PROFILE_ID } from "@/lib/profiles";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <>
      <div className="card">
        <h1>Broken Access Control demo</h1>
        <p>
          This app demonstrates a real <strong>OWASP Broken Access Control
          </strong> failure: a Broken Object Level Authorization (
          <strong>BOLA</strong>) / Insecure Direct Object Reference (
          <strong>IDOR</strong>) vulnerability, backed by the isolated RLS Red
          Alert demo&apos;s real Postgres database and Row Level Security
          policies (the same <code>public.clients</code> table and policy
          that the Vibe Fixer scanner and repair pipeline operate on).
        </p>
        <p className="muted">
          Every account in this environment is synthetic. Nothing here is a
          real person.
        </p>
      </div>

      <div className="card">
        <h2>Try it yourself</h2>
        <ol>
          <li>
            Sign in as <strong>Bob</strong> (Trainer A) on the{" "}
            <Link href="/login">sign-in page</Link> using the demo
            credentials provisioned for this environment.
          </li>
          <li>
            Visit <code>/profiles/{MIN_PROFILE_ID}</code>. This is one of
            Bob&apos;s own clients. Authorized.
          </li>
          <li>
            Now edit the number in the address bar and try every profile
            from <code>/profiles/{MIN_PROFILE_ID}</code> through{" "}
            <code>/profiles/{MAX_PROFILE_ID}</code>. Some of them belong to
            another trainer entirely, yet the app returns their private
            client records too.
          </li>
        </ol>
        <p>
          The root cause: the Postgres Row Level Security policy on{" "}
          <code>public.clients</code> grants <code>SELECT</code> to any
          authenticated user, instead of scoping rows to{" "}
          <code>trainer_id = auth.uid()</code>. This app&apos;s profile page
          performs no additional ownership check of its own — it queries by
          position and trusts the database to enforce who may see what. It
          doesn&apos;t.
        </p>
        {user ? (
          <Link href="/account" className="button">
            Go to my account
          </Link>
        ) : (
          <Link href="/login" className="button">
            Sign in to try it
          </Link>
        )}
      </div>
    </>
  );
}
