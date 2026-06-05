import { defineHandler } from "void";
import { checkAppBySlug } from "../../../src/appops";

export const POST = defineHandler(async (c) => {
  const slug = c.req.param("slug");
  const result = await checkAppBySlug(slug);
  const accept = c.req.header("accept") ?? "";

  if (!result) {
    if (accept.includes("text/html")) return c.redirect("/admin");
    return c.json({ error: "App not found or inactive" }, 404);
  }

  if (accept.includes("text/html")) {
    return c.redirect("/admin");
  }

  return result;
});
