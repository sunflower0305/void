# void1

Void + React starter，使用 Pages mode、文件路由 API 和 Cloudflare D1。当前生产环境直接部署到 Cloudflare Workers，不走 Void 平台账号。

线上地址：

- App: https://void.zhangleyang.com
- API: https://void.zhangleyang.com/api/hello

## 技术栈

- Void `0.9.0`
- React `19`
- Vite `8` + Vite+ (`vp`)
- Hono route handlers
- Cloudflare Workers
- Cloudflare D1
- Wrangler `4.x`

## 目录

```text
pages/              Pages mode 页面和服务端 loader
routes/             文件路由 API
db/schema.ts        Drizzle D1 schema
db/migrations/      D1 迁移文件
wrangler.jsonc      Cloudflare Workers 直部署配置
void.json           Void 项目配置
```

## 本地开发

这个项目用 Vite+ 启动和构建，`package.json` 里的脚本实际对应：

- `pnpm dev` -> `vp dev`
- `pnpm run build` -> `vp build`
- `pnpm preview` -> `vp preview`

安装依赖：

```bash
pnpm install
```

启动开发服务器：

```bash
pnpm dev
# 或直接运行：pnpm exec vp dev
```

构建：

```bash
pnpm run build
# 或直接运行：pnpm exec vp build
```

预览构建产物：

```bash
pnpm preview
# 或直接运行：pnpm exec vp preview
```

## 数据库

项目使用 `void/db` 访问 D1，schema 定义在 `db/schema.ts`。当前生产数据库是 `void1-db`，在 `wrangler.jsonc` 中绑定为 `DB`。

本地原型阶段可以直接推 schema：

```bash
pnpm exec void db push
```

生产发布前生成迁移：

```bash
pnpm exec void db generate
```

应用远端 D1 迁移：

```bash
pnpm exec wrangler d1 migrations apply void1-db --remote
```

查看远端表：

```bash
pnpm exec wrangler d1 execute void1-db --remote --command "SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name;"
```

## Cloudflare 凭据

不要把 `CLOUDFLARE_API_TOKEN` 放到项目根目录的 `.env.local`。Void/Vite 会读取项目里的 `.env*`，这些值可能进入 Worker 构建产物。

推荐把 token 放在 shell 配置或仓库外的私有文件里。fish 示例：

```fish
set -Ux CLOUDFLARE_API_TOKEN "你的 token"
```

zsh 示例：

```zsh
export CLOUDFLARE_API_TOKEN="你的 token"
```

`CLOUDFLARE_ACCOUNT_ID` 不是必需项。当前 token 只关联一个 Cloudflare account，Wrangler 可以自动推断账号。

## 部署到 Cloudflare

本项目没有 Void 账号，部署走 Cloudflare 直部署路径：

1. Void/Vite 构建 Worker 和静态资源。
2. `vp build` 调用 Void 和 Cloudflare Vite 插件，生成 `dist/ssr/wrangler.json`。
3. Wrangler 使用生成配置部署 Worker、assets、D1 绑定和 Custom Domain。

部署前确认 `wrangler.jsonc` 中的配置：

- Worker name: `void1`
- Custom Domain: `void.zhangleyang.com`
- D1 database: `void1-db`
- D1 binding: `DB`

部署命令：

```bash
pnpm run build
pnpm exec wrangler deploy --dry-run
pnpm exec wrangler deploy
```

也可以直接用 `vp` 构建：

```bash
pnpm exec vp build
pnpm exec wrangler deploy --dry-run
pnpm exec wrangler deploy
```

部署后验证：

```bash
curl -fsS https://void.zhangleyang.com/
curl -fsS https://void.zhangleyang.com/api/hello
pnpm exec wrangler deployments list --name void1
```

## 注意事项

- `.env*` 已被 `.gitignore` 忽略，只保留 `.env.example` 可以提交。
- `dist/`、`.void/`、`.wrangler/` 都是生成产物，不提交。
- `wrangler.jsonc` 不需要写 `main` 或 `assets`，Void/Cloudflare Vite 插件会在构建时生成。
- 不要在 `wrangler.jsonc` 里重复写 `nodejs_als`。Void 构建会注入该兼容标记，重复会导致 Cloudflare API 拒绝部署。
