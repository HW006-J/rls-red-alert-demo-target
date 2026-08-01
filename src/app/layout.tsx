import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/actions";
import "./globals.css";

export const metadata: Metadata = {
  title: "RLS Red Alert — Broken Access Control Demo",
  description:
    "Intentionally vulnerable security demo: a Broken Object Level Authorization (BOLA/IDOR) walkthrough over synthetic data only.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <html lang="en">
      <body>
        <div className="vuln-banner">
          ⚠️ INTENTIONALLY VULNERABLE SECURITY DEMO — synthetic data only, not
          a real product. Read more in{" "}
          <a
            href="https://github.com/HW006-J/rls-red-alert-demo-target#readme"
            target="_blank"
            rel="noreferrer"
          >
            the README
          </a>
          .
        </div>
        <header className="topbar">
          <Link href="/" className="topbar-brand">
            RLS Red Alert Demo
          </Link>
          <nav className="topbar-nav">
            {user ? (
              <>
                <span className="muted">{user.email}</span>
                <Link href="/account">My account</Link>
                <form action={signOut}>
                  <button type="submit" className="button secondary">
                    Sign out
                  </button>
                </form>
              </>
            ) : (
              <Link href="/login" className="button">
                Sign in
              </Link>
            )}
          </nav>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
