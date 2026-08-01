import { describe, expect, it } from "vitest";
import {
  MAX_PROFILE_ID,
  MIN_PROFILE_ID,
  deriveAccessStatus,
  parseProfileId,
} from "./profiles";

describe("parseProfileId", () => {
  it.each([
    ["1", 1],
    ["2", 2],
    ["3", 3],
    ["4", 4],
  ])("accepts %s", (raw, expected) => {
    expect(parseProfileId(raw)).toBe(expected);
  });

  it.each(["0", "5", "-1", "1.5", "abc", "", " 1", "1 ", "01e1"])(
    "rejects %s",
    (raw) => {
      expect(parseProfileId(raw)).toBeNull();
    }
  );

  it("bounds match the four seeded demo clients", () => {
    expect(MIN_PROFILE_ID).toBe(1);
    expect(MAX_PROFILE_ID).toBe(4);
  });
});

describe("deriveAccessStatus", () => {
  it("is owned when the row's trainer_id matches the caller", () => {
    expect(
      deriveAccessStatus({ trainer_id: "user-a" }, "user-a")
    ).toBe("owned");
  });

  it("is foreign when the row's trainer_id does not match the caller", () => {
    expect(
      deriveAccessStatus({ trainer_id: "user-b" }, "user-a")
    ).toBe("foreign");
  });
});
