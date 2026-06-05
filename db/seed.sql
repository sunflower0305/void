INSERT OR IGNORE INTO apps (name, slug, url, description, stack, is_active)
VALUES
  (
    '乐扬博客',
    'blog',
    'https://blog.zhangleyang.com',
    'Next/OpenNext 博客应用，使用 D1/R2/Worker 和自定义域名承载内容发布。',
    'Cloudflare Workers, D1, R2, OpenNext, Custom Domain',
    1
  ),
  (
    'AI 求职助手',
    'job',
    'https://job.zhangleyang.com',
    '职位推荐、薪资预测和简历优化入口，作为真实业务应用被纳入监控。',
    'Cloudflare Workers, Next.js, AI, ML, Custom Domain',
    1
  ),
  (
    'Void Todo Lite',
    'todo',
    'https://todo.zhangleyang.com',
    'Void + React + Drizzle + D1 的轻量 Todo 应用，展示最小全栈闭环。',
    'Void, React, D1, Drizzle, Cloudflare Workers',
    1
  ),
  (
    '乐扬主页',
    'home',
    'https://zhangleyang.com',
    '基于 Cloudflare Pages 的个人主页，作为静态站点入口纳入统一健康监控。',
    'Cloudflare Pages, Static Site, Custom Domain',
    1
  ),
  (
    'Void 极简 Demo',
    'demo',
    'https://demo.zhangleyang.com',
    '基于 Cloudflare Workers + D1 的 Void 极简 demo，用来展示最小全栈应用形态。',
    'Void, Cloudflare Workers, D1, Drizzle, Custom Domain',
    1
  ),
  (
    'Cloudflare AppOps Dashboard',
    'self',
    'https://void.zhangleyang.com',
    '当前项目自身，上线后加入自监控，形成应用运维闭环。',
    'Void, Vite+, React, D1, Wrangler',
    1
  );
