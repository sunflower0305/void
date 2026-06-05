import { describe, expect, it } from "vitest";
import { buildDashboardData, deriveCheckStatus, deriveHttpErrorMessage } from "./appops-model";

const apps = [
  {
    id: 1,
    name: "Blog",
    slug: "blog",
    url: "https://blog.example.com",
    stack: "Workers, D1, R2",
  },
  {
    id: 2,
    name: "Demo",
    slug: "demo",
    url: "https://demo.example.com",
    stack: "Void, Workers, D1",
  },
];

const runs = [
  { id: 4, appId: 2, status: "degraded" as const, checkedAt: "2026-06-05 04:04:00" },
  { id: 3, appId: 1, status: "up" as const, checkedAt: "2026-06-05 04:03:00" },
  { id: 2, appId: 1, status: "down" as const, checkedAt: "2026-06-05 04:02:00" },
  { id: 1, appId: 99, status: "up" as const, checkedAt: "2026-06-05 04:01:00" },
];

describe("deriveCheckStatus", () => {
  it("treats 2xx and 3xx responses as up", () => {
    expect(deriveCheckStatus(200)).toBe("up");
    expect(deriveCheckStatus(302)).toBe("up");
  });

  it("treats other HTTP responses as degraded", () => {
    expect(deriveCheckStatus(404)).toBe("degraded");
    expect(deriveCheckStatus(522)).toBe("degraded");
  });
});

describe("deriveHttpErrorMessage", () => {
  it("does not record an error message for up responses", () => {
    expect(deriveHttpErrorMessage("up", "Found")).toBeNull();
  });

  it("records a useful default for degraded responses", () => {
    expect(deriveHttpErrorMessage("degraded", "")).toBe("Non-2xx/3xx response");
  });
});

describe("buildDashboardData", () => {
  it("attaches latest status, stack labels, and recent runs to each app", () => {
    const data = buildDashboardData(apps, runs);

    expect(data.apps[0]).toMatchObject({
      slug: "blog",
      status: "up",
      stackItems: ["Workers", "D1", "R2"],
      latestRun: runs[1],
      recentRuns: [runs[1], runs[2]],
    });
    expect(data.apps[1]).toMatchObject({
      slug: "demo",
      status: "degraded",
      latestRun: runs[0],
    });
  });

  it("builds the public recent run feed and skips runs for unknown apps", () => {
    const data = buildDashboardData(apps, runs);

    expect(data.recentRuns).toEqual([
      { ...runs[0], app: { name: "Demo", slug: "demo", url: "https://demo.example.com" } },
      { ...runs[1], app: { name: "Blog", slug: "blog", url: "https://blog.example.com" } },
      { ...runs[2], app: { name: "Blog", slug: "blog", url: "https://blog.example.com" } },
    ]);
  });

  it("marks apps with no runs as unknown", () => {
    const data = buildDashboardData([apps[0]], []);

    expect(data.apps[0]).toMatchObject({
      status: "unknown",
      latestRun: null,
      recentRuns: [],
    });
  });
});
