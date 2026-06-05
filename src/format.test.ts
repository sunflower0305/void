import { describe, expect, it } from "vitest";
import { formatCheckedAt, formatLatency, splitStack } from "./format";

describe("splitStack", () => {
  it("trims comma-separated stack labels and drops empty values", () => {
    expect(splitStack("Void, Cloudflare Workers, D1, , Custom Domain")).toEqual([
      "Void",
      "Cloudflare Workers",
      "D1",
      "Custom Domain",
    ]);
  });
});

describe("formatLatency", () => {
  it("formats missing values as unchecked", () => {
    expect(formatLatency(null)).toBe("未检测");
    expect(formatLatency(undefined)).toBe("未检测");
  });

  it("formats millisecond and second values", () => {
    expect(formatLatency(156)).toBe("156ms");
    expect(formatLatency(1250)).toBe("1.25s");
  });
});

describe("formatCheckedAt", () => {
  it("formats missing timestamps as unchecked", () => {
    expect(formatCheckedAt(null)).toBe("尚未检测");
  });

  it("keeps SQLite timestamps readable and normalizes ISO timestamps", () => {
    expect(formatCheckedAt("2026-06-05 04:50:40")).toBe("2026-06-05 04:50:40");
    expect(formatCheckedAt("2026-06-05T04:50:40.000Z")).toBe("2026-06-05 04:50:40 UTC");
  });
});
