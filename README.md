# Cloudflare AppOps Dashboard

[![Cloudflare](https://img.shields.io/badge/Cloudflare-F38020?logo=cloudflare&logoColor=white)](https://void.zhangleyang.com)
[![zread](https://raw.githubusercontent.com/sunflower0305/claude-proxy/master/docs/assets/zread-badge.svg)](https://zread.ai/sunflower0305/void)

介绍文章：https://blog.zhangleyang.com/2026-06-05-b48pzt

Void + React + D1 应用健康看板，用来监控已经发布在 Cloudflare 上的真实应用：

- Blog: https://blog.zhangleyang.com
- Job: https://job.zhangleyang.com
- Todo: https://todo.zhangleyang.com
- Home: https://zhangleyang.com
- Demo: https://demo.zhangleyang.com
- Self: https://void.zhangleyang.com

这个项目使用 Void 的 `pages/` 页面模式、`routes/` 文件路由 API 和 Cloudflare D1。当前生产环境直接部署到 Cloudflare Workers，不走 Void 平台部署。

线上地址：

- App: https://void.zhangleyang.com
- API: https://void.zhangleyang.com/api/status

## 技术栈

- Void `0.9.0`
- React `19`
- Vite `8` + Vite+ (`vp`)
- Hono route handlers
- Cloudflare Workers
- Cloudflare D1
- Wrangler `4.x`

## 功能

- `/`：公开应用健康看板，展示当前状态、响应时间、最近检测时间、技术栈标签和最近检测记录。
- `/admin`：轻量管理台，支持添加、编辑、启用/停用监控目标，并手动触发检测。
- `POST /api/check`：检测所有启用的应用。
- `POST /api/check/:slug`：检测单个应用。
- `GET /api/status`：输出公开 JSON 状态，方便文章展示 API route。

## 目录

```text
pages/              Void 页面模式和服务端 loader
routes/             文件路由 API
db/schema.ts        Drizzle D1 schema
db/migrations/      D1 迁移文件
src/appops.ts       应用聚合和健康检测服务
wrangler.jsonc      Cloudflare Workers 部署配置
```

## 本地开发

这个项目用 Vite+ 启动和构建，`package.json` 里的脚本实际对应：

- `vp dev`
- `vp build`
- `vp preview`

安装依赖：

```bash
vp install
```

启动开发服务器：

```bash
vp dev
```

构建：

```bash
vp build
```

运行测试：

```bash
vp run test
```

预览构建产物：

```bash
vp preview
```

## 数据库

项目使用 `void/db` 访问 D1，schema 定义在 `db/schema.ts`。当前生产数据库是 `void1-db`，在 `wrangler.jsonc` 中绑定为 `DB`。

当前核心表：

- `apps`：监控目标，包括名称、slug、URL、描述、技术栈和启用状态。
- `check_runs`：每一次健康检测结果，包括状态、HTTP 状态码、响应时间和错误信息。

本地原型阶段可以直接推 schema：

```bash
vp exec void db push
```

生产发布前生成迁移：

```bash
vp exec void db generate
```

应用远端 D1 迁移：

```bash
vp exec wrangler d1 migrations apply void1-db --remote
```

向远端 D1 写入默认监控目标：

```bash
vp run db:seed:remote
```

查看远端表：

```bash
vp exec wrangler d1 execute void1-db --remote --command "SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name;"
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
vp run deploy:dry-run
vp run deploy
```

拆开执行时，对应命令是：

```bash
vp exec wrangler d1 migrations apply void1-db --remote
vp exec wrangler d1 execute void1-db --remote --file db/seed.sql
vp build
vp exec wrangler deploy --dry-run
vp exec wrangler deploy
```

GitHub Actions 会在 `main` 分支 push 后自动执行同一条链路。仓库需要配置 `CLOUDFLARE_API_TOKEN` 这个 GitHub Secret。

部署后验证：

```bash
curl -fsS https://void.zhangleyang.com/
curl -fsS https://void.zhangleyang.com/api/status
vp exec wrangler deployments list --name void1
```

手动触发一次线上检测：

```bash
curl -fsS -X POST https://void.zhangleyang.com/api/check
curl -fsS https://void.zhangleyang.com/api/status
```

## 注意事项

- `.env*` 已被 `.gitignore` 忽略，只保留 `.env.example` 可以提交。
- `dist/`、`.void/`、`.wrangler/`、`.agents/` 都是生成或本机辅助目录，不提交。
- `wrangler.jsonc` 不需要写 `main` 或 `assets`，Void/Cloudflare Vite 插件会在构建时生成。
- 不要在 `wrangler.jsonc` 里重复写 `nodejs_als`。Void 构建会注入该兼容标记，重复会导致 Cloudflare API 拒绝部署。
- 第一版不接 Cloudflare GraphQL/API，不需要把 `CLOUDFLARE_API_TOKEN` 放进项目。
- 第一版不配置 Cron Trigger，健康检测通过 `/admin` 或 `POST /api/check` 手动触发。
