import { defineHandler, type InferProps } from "void";
import { getDashboardData } from "../../src/appops";

export type Props = InferProps<typeof loader>;

export const loader = defineHandler(async () => {
  return getDashboardData({ includeInactive: true });
});
