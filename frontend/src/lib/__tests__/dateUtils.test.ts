import { describe, it, expect } from "vitest";
import {
  safeParseDate,
  isValidDateString,
  isEndDateAfterStartDate,
} from "../dateUtils";

describe("dateUtils", () => {
  describe("safeParseDate", () => {
    it("parses valid date strings to ISO format", () => {
      const result = safeParseDate("2026-05-15T10:30");
      expect(result).toBeTruthy();
      expect(result).toContain("2026-05-15");
    });

    it("returns null for empty strings", () => {
      expect(safeParseDate("")).toBeNull();
    });

    it("returns null for invalid dates", () => {
      expect(safeParseDate("invalid-date")).toBeNull();
      expect(safeParseDate("2026-13-45")).toBeNull();
    });

    it("handles undefined input gracefully", () => {
      expect(safeParseDate(undefined as any)).toBeNull();
    });
  });

  describe("isValidDateString", () => {
    it("returns true for valid date strings", () => {
      expect(isValidDateString("2026-05-15T10:30")).toBe(true);
      expect(isValidDateString("2026-05-15")).toBe(true);
    });

    it("returns false for invalid dates", () => {
      expect(isValidDateString("invalid")).toBe(false);
      expect(isValidDateString("2026-13-45")).toBe(false);
    });

    it("returns false for empty or undefined strings", () => {
      expect(isValidDateString("")).toBe(false);
      expect(isValidDateString(undefined)).toBe(false);
    });
  });

  describe("isEndDateAfterStartDate", () => {
    it("returns true when end date is after start date", () => {
      expect(isEndDateAfterStartDate("2026-05-10T10:00", "2026-05-15T10:00")).toBe(true);
    });

    it("returns false when end date is before start date", () => {
      expect(isEndDateAfterStartDate("2026-05-15T10:00", "2026-05-10T10:00")).toBe(false);
    });

    it("returns false when dates are equal", () => {
      expect(isEndDateAfterStartDate("2026-05-10T10:00", "2026-05-10T10:00")).toBe(false);
    });

    it("handles invalid dates gracefully", () => {
      expect(isEndDateAfterStartDate("invalid", "2026-05-10T10:00")).toBe(false);
      expect(isEndDateAfterStartDate("2026-05-10T10:00", "invalid")).toBe(false);
    });
  });
});
