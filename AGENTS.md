## Project Notes

This project uses Void as the application framework, but does not deploy through the Void platform.

Void still owns the app conventions:

- `pages/` contains server-rendered pages and colocated server loaders.
- `routes/` contains file-based API routes using Hono-style handlers.
- `db/schema.ts` defines Drizzle D1 tables.
- Runtime database access uses `void/db`, and schema imports should use `@schema`.
- Vite+ is used for dev/build/preview through `vp dev`, `vp build`, and `vp preview`.

Deployment goes directly to the user's Cloudflare account with Wrangler:

- `wrangler.jsonc` is the source of truth for Worker name, custom domain, D1 binding, and D1 database ID.
- `pnpm run build` runs `vp build`, which generates `dist/ssr/wrangler.json`.
- `pnpm run db:migrate:remote` applies `db/migrations/` to the remote D1 database.
- `pnpm run deploy:dry-run` builds and validates the deploy without uploading.
- `pnpm run deploy` applies remote migrations, builds, and runs `wrangler deploy`.

Do not use the Void platform deploy CLI, Void platform token secrets, project linking, or Void platform domain commands for this repository.

Keep `CLOUDFLARE_API_TOKEN` outside project `.env*` files. Project dotenv files are ignored because Void/Vite can load them into Worker build/runtime variables. For local deploys, use shell environment variables. For GitHub Actions, use the `CLOUDFLARE_API_TOKEN` repository secret.

Keep `tsconfig.json` extending `./.void/tsconfig.json`. The `.void/` directory is generated and ignored, but it provides generated route, DB, and alias types. Fresh clones should run `pnpm run build`, `pnpm dev`, or `pnpm exec void prepare` before typechecking if `.void/` is missing.
