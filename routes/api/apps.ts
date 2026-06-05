import { apps } from "@schema";
import { defineHandler } from "void";
import { db, eq } from "void/db";

function readString(form: FormData, name: string) {
  const value = form.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function normalizeSlug(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function isHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

export const POST = defineHandler(async (c) => {
  const form = await c.req.formData();
  const intent = readString(form, "intent");
  const payload = {
    name: readString(form, "name"),
    slug: normalizeSlug(readString(form, "slug")),
    url: readString(form, "url"),
    description: readString(form, "description"),
    stack: readString(form, "stack"),
    isActive: form.get("isActive") === "true",
    updatedAt: new Date().toISOString(),
  };

  if (
    !payload.name ||
    !payload.slug ||
    !payload.url ||
    !payload.description ||
    !payload.stack ||
    !isHttpUrl(payload.url)
  ) {
    return c.redirect("/admin");
  }

  try {
    if (intent === "create") {
      await db
        .insert(apps)
        .values({
          ...payload,
          isActive: true,
        })
        .onConflictDoNothing({ target: apps.slug });
      return c.redirect("/admin");
    }

    if (intent === "update") {
      const id = Number(readString(form, "id"));
      if (Number.isFinite(id)) {
        await db.update(apps).set(payload).where(eq(apps.id, id));
      }
    }
  } catch {
    return c.redirect("/admin");
  }

  return c.redirect("/admin");
});
