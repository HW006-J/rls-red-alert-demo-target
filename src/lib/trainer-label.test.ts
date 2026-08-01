import { describe, expect, it } from "vitest";
import { trainerDisplayName } from "./trainer-label";

describe("trainerDisplayName", () => {
  it("maps Trainer A's demo email to the Bob persona label", () => {
    expect(trainerDisplayName("trainer-a@rls-red-alert-demo.test")).toBe(
      "Bob (Trainer A)"
    );
  });

  it("maps Trainer B's demo email to a label", () => {
    expect(trainerDisplayName("trainer-b@rls-red-alert-demo.test")).toBe(
      "Trainer B"
    );
  });

  it("returns null for unknown emails, never fabricating a label", () => {
    expect(trainerDisplayName("someone-else@example.test")).toBeNull();
  });

  it("returns null for missing email", () => {
    expect(trainerDisplayName(null)).toBeNull();
    expect(trainerDisplayName(undefined)).toBeNull();
  });
});
