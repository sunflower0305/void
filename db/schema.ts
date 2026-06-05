import { sql } from "void/db";
import { integer, sqliteTable, text } from "void/schema-d1";

export const apps = sqliteTable("apps", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  url: text("url").notNull(),
  description: text("description").notNull(),
  stack: text("stack").notNull(),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
  updatedAt: text("updated_at").notNull().default(sql`(datetime('now'))`),
});

export const checkRuns = sqliteTable("check_runs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  appId: integer("app_id")
    .notNull()
    .references(() => apps.id, { onDelete: "cascade" }),
  status: text("status", { enum: ["up", "degraded", "down"] }).notNull(),
  httpStatus: integer("http_status"),
  responseTimeMs: integer("response_time_ms").notNull(),
  errorMessage: text("error_message"),
  checkedAt: text("checked_at").notNull().default(sql`(datetime('now'))`),
});
