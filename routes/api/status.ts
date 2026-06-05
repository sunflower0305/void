import { defineHandler } from "void";
import { getDashboardData } from "../../src/appops";

export const GET = defineHandler(async () => {
  const data = await getDashboardData();
  return {
    generatedAt: new Date().toISOString(),
    apps: data.apps.map((app) => ({
      name: app.name,
      slug: app.slug,
      url: app.url,
      description: app.description,
      stack: app.stackItems,
      status: app.status,
      latestRun: app.latestRun,
    })),
    recentRuns: data.recentRuns,
  };
});
