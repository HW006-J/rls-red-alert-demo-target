import { signIn } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="card">
      <h1>Sign in</h1>
      <p className="muted">
        Demo credentials — all accounts use synthetic <code>*.test</code>{" "}
        email addresses and the shared password below (this is a throwaway
        security demo, not a real login).
      </p>
      <div className="profile-grid" style={{ marginBottom: "1.25rem" }}>
        <dt>Email</dt>
        <dd>
          <code>bob@rls-red-alert-demo.test</code>
        </dd>
        <dt>Password</dt>
        <dd>
          <code>DemoPassw0rd!</code>
        </dd>
      </div>

      {error && <div className="error-box">{error}</div>}

      <form action={signIn}>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            defaultValue="bob@rls-red-alert-demo.test"
            required
          />
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            defaultValue="DemoPassw0rd!"
            required
          />
        </div>
        <button type="submit" className="button">
          Sign in
        </button>
      </form>
    </div>
  );
}
