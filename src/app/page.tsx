import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

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
          This tiny app exists to demonstrate a real{" "}
          <strong>OWASP Broken Access Control</strong> failure: a Broken
          Object Level Authorization (<strong>BOLA</strong>) /{" "}
          Insecure Direct Object Reference (<strong>IDOR</strong>)
          vulnerability, backed by an actual Postgres database with Row Level
          Security enabled.
        </p>
        <p className="muted">
          Every account below is synthetic (<code>*.test</code> email
          addresses, invented names and notes). Nothing here is a real
          person.
        </p>
      </div>

      <div className="card">
        <h2>Try it yourself</h2>
        <ol>
          <li>
            Sign in as <strong>Bob</strong> — see the{" "}
            <Link href="/login">sign-in page</Link> for demo credentials.
          </li>
          <li>
            Visit your own profile at{" "}
            <code>/profiles/1</code>. This is authorized: it&apos;s Bob&apos;s
            own account.
          </li>
          <li>
            Now edit the number in the address bar — try{" "}
            <code>/profiles/2</code>, <code>/profiles/3</code>,{" "}
            <code>/profiles/4</code>, <code>/profiles/5</code>. The app will
            happily return other people&apos;s private contact details and
            notes, even though Bob is not authorized to see them.
          </li>
        </ol>
        <p>
          The root cause: the Postgres Row Level Security policy on the
          demo&apos;s <code>account_profiles</code> table grants{" "}
          <code>SELECT</code> to any authenticated user, instead of scoping
          rows to <code>owner_id = auth.uid()</code>. The app itself performs
          no extra ownership check, so the database happily hands back rows
          that belong to other users.
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
