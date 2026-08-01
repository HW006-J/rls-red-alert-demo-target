export const MIN_PROFILE_ID = 1;
export const MAX_PROFILE_ID = 4;

/**
 * Validates and parses the `[id]` URL segment for /profiles/[id]. Only
 * plain positive integers within the known demo range are accepted --
 * this is input validation for a route param, not an access-control
 * check (the actual authorization gap this demo illustrates lives in the
 * database query in profiles/[id]/page.tsx, not here).
 */
export function parseProfileId(raw: string): number | null {
  if (!/^[0-9]+$/.test(raw)) return null;
  const parsed = Number(raw);
  if (!Number.isInteger(parsed)) return null;
  if (parsed < MIN_PROFILE_ID || parsed > MAX_PROFILE_ID) return null;
  return parsed;
}

export type ClientRow = {
  id: string;
  trainer_id: string;
  name: string;
  email: string | null;
  private_notes: string | null;
  created_at: string;
};

export type AccessStatus = "owned" | "foreign";

/**
 * Derived purely from the row actually returned by the database and the
 * caller's real authenticated user id -- never from the requested index.
 * Whether a given /profiles/N happens to be "owned" or "foreign" is not
 * known ahead of time by this code; it falls out of whichever row Row
 * Level Security allowed the query in page.tsx to see.
 */
export function deriveAccessStatus(
  row: Pick<ClientRow, "trainer_id">,
  currentUserId: string
): AccessStatus {
  return row.trainer_id === currentUserId ? "owned" : "foreign";
}
