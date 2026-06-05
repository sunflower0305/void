import { defineHandler } from "void";
import { checkActiveApps } from "../../src/appops";

export const POST = defineHandler(async (c) => {
  const results = await checkActiveApps();
  const accept = c.req.header("accept") ?? "";

  if (accept.includes("text/html")) {
    return c.redirect("/admin");
  }

  return {
    checked: results.length,
    results,
  };
});
