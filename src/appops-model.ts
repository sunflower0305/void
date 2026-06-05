import { splitStack } from "./format";

export type AppStatus = "up" | "degraded" | "down" | "unknown";
export type CheckStatus = Exclude<AppStatus, "unknown">;

export type BasicApp = {
  id: number;
  name: string;
  slug: string;
  url: string;
  stack: string;
};

export type BasicCheckRun = {
  id: number;
  appId: number;
  status: CheckStatus;
  checkedAt: string;
};

export type AppSummary<App extends BasicApp, Run extends BasicCheckRun> = App & {
  latestRun: Run | null;
  recentRuns: Run[];
  status: AppStatus;
  stackItems: string[];
};

export type DashboardData<App extends BasicApp, Run extends BasicCheckRun> = {
  apps: Array<AppSummary<App, Run>>;
  recentRuns: Array<Run & { app: Pick<App, "name" | "slug" | "url"> }>;
};

export function deriveCheckStatus(httpStatus: number): Exclude<CheckStatus, "down"> {
  return httpStatus >= 200 && httpStatus < 400 ? "up" : "degraded";
}

export function deriveHttpErrorMessage(
  status: CheckStatus,
  statusText: string | null | undefined,
) {
  if (status === "up") return null;
  return statusText || "Non-2xx/3xx response";
}

export function buildDashboardData<App extends BasicApp, Run extends BasicCheckRun>(
  rows: App[],
  runs: Run[],
): DashboardData<App, Run> {
  const runsByApp = new Map<number, Run[]>();
  for (const run of runs) {
    const group = runsByApp.get(run.appId) ?? [];
    group.push(run);
    runsByApp.set(run.appId, group);
  }

  const apps = rows.map((app) => {
    const recentRuns = runsByApp.get(app.id) ?? [];
    const latestRun = recentRuns[0] ?? null;
    return {
      ...app,
      latestRun,
      recentRuns: recentRuns.slice(0, 6),
      status: latestRun?.status ?? "unknown",
      stackItems: splitStack(app.stack),
    };
  });

  const appById = new Map(rows.map((app) => [app.id, app]));
  const recentRuns = runs.slice(0, 12).flatMap((run) => {
    const app = appById.get(run.appId);
    if (!app) return [];
    return [{ ...run, app: { name: app.name, slug: app.slug, url: app.url } }];
  });

  return { apps, recentRuns };
}
