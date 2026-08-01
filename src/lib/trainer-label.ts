const TRAINER_LABELS: Record<string, string> = {
  "trainer-a@rls-red-alert-demo.test": "Bob (Trainer A)",
  "trainer-b@rls-red-alert-demo.test": "Trainer B",
};

/**
 * Purely presentational: maps the demo's known synthetic trainer emails to
 * a friendlier display name. Returns null for anyone else, so callers fall
 * back to showing the raw email rather than a fake label -- this never
 * substitutes for or hides the real signed-in identity.
 */
export function trainerDisplayName(
  email: string | null | undefined
): string | null {
  if (!email) return null;
  return TRAINER_LABELS[email] ?? null;
}
