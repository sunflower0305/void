import { apps, checkRuns } from "@schema";
import { and, db, desc, eq, inArray } from "void/db";
import {
  buildDashboardData,
  deriveCheckStatus,
  deriveHttpErrorMessage,
  type AppStatus,
} from "./appops-model";

export type { AppStatus } from "./appops-model";

export type AppRecord = typeof apps.$inferSelect;
export type CheckRunRecord = typeof checkRuns.$inferSelect;

export type AppSummary = AppRecord & {
  latestRun: CheckRunRecord | null;
  recentRuns: CheckRunRecord[];
  status: AppStatus;
  stackItems: string[];
};

export type DashboardData = {
  apps: AppSummary[];
  recentRuns: Array<CheckRunRecord & { app: Pick<AppRecord, "name" | "slug" | "url"> }>;
};

const CHECK_TIMEOUT_MS = 8000;

export async function getDashboardData(options: { includeInactive?: boolean } = {}) {
  const rows = options.includeInactive
    ? await db.select().from(apps).orderBy(apps.id)
    : await db.select().from(apps).where(eq(apps.isActive, true)).orderBy(apps.id);

  const appIds = rows.map((app) => app.id);
  const runs =
    appIds.length === 0
      ? []
      : await db
          .select()
          .from(checkRuns)
          .where(inArray(checkRuns.appId, appIds))
          .orderBy(desc(checkRuns.checkedAt), desc(checkRuns.id))
          .limit(80);

  return buildDashboardData(rows, runs) satisfies DashboardData;
}

export async function checkApp(app: AppRecord) {
  const startedAt = Date.now();

  if (app.slug === "self") {
    const [created] = await db
      .insert(checkRuns)
      .values({
        appId: app.id,
        status: "up",
        httpStatus: 200,
        responseTimeMs: 0,
        errorMessage: null,
      })
      .returning();

    return created;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort("timeout"), CHECK_TIMEOUT_MS);

  try {
    const response = await fetch(app.url, {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "user-agent": "Cloudflare-AppOps-Dashboard/1.0",
      },
    });
    const responseTimeMs = Date.now() - startedAt;
    const status = deriveCheckStatus(response.status);

    const [created] = await db
      .insert(checkRuns)
      .values({
        appId: app.id,
        status,
        httpStatus: response.status,
        responseTimeMs,
        errorMessage: deriveHttpErrorMessage(status, response.statusText),
      })
      .returning();

    return created;
  } catch (error) {
    const responseTimeMs = Date.now() - startedAt;
    const message = error instanceof Error ? error.message : "Request failed";
    const [created] = await db
      .insert(checkRuns)
      .values({
        appId: app.id,
        status: "down",
        httpStatus: null,
        responseTimeMs,
        errorMessage: message,
      })
      .returning();

    return created;
  } finally {
    clearTimeout(timeout);
  }
}

export async function checkActiveApps() {
  const targets = await db.select().from(apps).where(eq(apps.isActive, true)).orderBy(apps.id);
  const results = [];

  for (const app of targets) {
    results.push(await checkApp(app));
  }

  return results;
}

export async function checkAppBySlug(slug: string) {
  const [app] = await db
    .select()
    .from(apps)
    .where(and(eq(apps.slug, slug), eq(apps.isActive, true)))
    .limit(1);

  if (!app) return null;
  return checkApp(app);
}
