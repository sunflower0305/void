import { defineSeed } from "void/seed";

const DEFAULT_APPS = [
  {
    name: "乐扬博客",
    slug: "blog",
    url: "https://blog.zhangleyang.com",
    description: "Next/OpenNext 博客应用，使用 D1/R2/Worker 和自定义域名承载内容发布。",
    stack: "Cloudflare Workers, D1, R2, OpenNext, Custom Domain",
  },
  {
    name: "AI 求职助手",
    slug: "job",
    url: "https://job.zhangleyang.com",
    description: "职位推荐、薪资预测和简历优化入口，作为真实业务应用被纳入监控。",
    stack: "Cloudflare Workers, Next.js, AI, ML, Custom Domain",
  },
  {
    name: "Void Todo Lite",
    slug: "todo",
    url: "https://todo.zhangleyang.com",
    description: "Void + React + Drizzle + D1 的轻量 Todo 应用，展示最小全栈闭环。",
    stack: "Void, React, D1, Drizzle, Cloudflare Workers",
  },
  {
    name: "乐扬主页",
    slug: "home",
    url: "https://zhangleyang.com",
    description: "基于 Cloudflare Pages 的个人主页，作为静态站点入口纳入统一健康监控。",
    stack: "Cloudflare Pages, Static Site, Custom Domain",
  },
  {
    name: "Void 极简 Demo",
    slug: "demo",
    url: "https://demo.zhangleyang.com",
    description: "基于 Cloudflare Workers + D1 的 Void 极简 demo，用来展示最小全栈应用形态。",
    stack: "Void, Cloudflare Workers, D1, Drizzle, Custom Domain",
  },
  {
    name: "Cloudflare AppOps Dashboard",
    slug: "self",
    url: "https://void.zhangleyang.com",
    description: "当前项目自身，上线后加入自监控，形成应用运维闭环。",
    stack: "Void, Vite+, React, D1, Wrangler",
  },
];

export default defineSeed<typeof import("./schema")>(async ({ db, schema }) => {
  await db.insert(schema.apps).values(DEFAULT_APPS).onConflictDoNothing({
    target: schema.apps.slug,
  });
});
