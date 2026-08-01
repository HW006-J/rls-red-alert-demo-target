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
        Use the demo trainer credentials provisioned for this environment.
        This is a synthetic security demo, not a real login.
      </p>

      {error && <div className="error-box">{error}</div>}

      <form action={signIn}>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" required autoComplete="email" />
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
          />
        </div>
        <button type="submit" className="button">
          Sign in
        </button>
      </form>
    </div>
  );
}
