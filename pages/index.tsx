import type { Props } from "./index.server";
import { formatCheckedAt, formatLatency } from "../src/format";

const STATUS_LABEL = {
  up: "正常",
  degraded: "异常响应",
  down: "不可达",
  unknown: "未检测",
} as const;

const STATUS_TONE = {
  up: "statusUp",
  degraded: "statusDegraded",
  down: "statusDown",
  unknown: "statusUnknown",
} as const;

export default function HomePage({ apps, recentRuns }: Props) {
  const activeCount = apps.length;
  const upCount = apps.filter((app) => app.status === "up").length;
  const downCount = apps.filter((app) => app.status === "down").length;
  const averageLatency = (() => {
    const values = apps
      .map((app) => app.latestRun?.responseTimeMs)
      .filter((value): value is number => typeof value === "number");
    if (values.length === 0) return null;
    return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
  })();

  return (
    <main className="page">
      <section className="topbar">
        <div>
          <p className="eyebrow">VOID · VITE+ · D1 · WORKERS</p>
          <h1>Cloudflare AppOps Dashboard</h1>
          <p className="lede">
            监控自己已经上线的 Blog、AI 求职助手、Void Todo、极简 Demo、个人主页和当前应用，把热点文章里的
            “工具链 + 云基础设施”变成一个可截图、可部署、可扩展的完整应用。
          </p>
        </div>
        <div className="actions">
          <a className="ghostButton" href="/api/status">
            JSON 状态
          </a>
          <a className="primaryButton" href="/admin">
            管理检测
          </a>
        </div>
      </section>

      <section className="metrics" aria-label="应用状态概览">
        <div>
          <span>监控应用</span>
          <strong>{activeCount}</strong>
        </div>
        <div>
          <span>正常</span>
          <strong>{upCount}</strong>
        </div>
        <div>
          <span>不可达</span>
          <strong>{downCount}</strong>
        </div>
        <div>
          <span>平均响应</span>
          <strong>{formatLatency(averageLatency)}</strong>
        </div>
      </section>

      <section className="appGrid" aria-label="应用列表">
        {apps.map((app) => (
          <article className="appCard" key={app.id}>
            <div className="cardHeader">
              <div>
                <p className="slug">/{app.slug}</p>
                <h2>{app.name}</h2>
              </div>
              <span className={`statusBadge ${STATUS_TONE[app.status]}`}>
                {STATUS_LABEL[app.status]}
              </span>
            </div>
            <p className="description">{app.description}</p>
            <a className="url" href={app.url} target="_blank" rel="noreferrer">
              {app.url.replace("https://", "")}
            </a>
            <div className="cardStats">
              <div>
                <span>HTTP</span>
                <strong>{app.latestRun?.httpStatus ?? "-"}</strong>
              </div>
              <div>
                <span>响应时间</span>
                <strong>{formatLatency(app.latestRun?.responseTimeMs)}</strong>
              </div>
              <div>
                <span>最近检测</span>
                <strong>{formatCheckedAt(app.latestRun?.checkedAt)}</strong>
              </div>
            </div>
            <div className="stack">
              {app.stackItems.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
          </article>
        ))}
      </section>

      <section className="lowerGrid">
        <article className="timeline">
          <div className="sectionHeader">
            <p className="eyebrow">RECENT CHECKS</p>
            <h2>最近检测记录</h2>
          </div>
          {recentRuns.length === 0 ? (
            <p className="empty">还没有检测记录。进入管理页手动触发一次检测。</p>
          ) : (
            <ol>
              {recentRuns.map((run) => (
                <li key={run.id}>
                  <span className={`dot ${STATUS_TONE[run.status]}`} />
                  <div>
                    <strong>{run.app.name}</strong>
                    <p>
                      {STATUS_LABEL[run.status]} · HTTP {run.httpStatus ?? "-"} ·{" "}
                      {formatLatency(run.responseTimeMs)} · {formatCheckedAt(run.checkedAt)}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </article>

        <article className="explain">
          <div className="sectionHeader">
            <p className="eyebrow">ARTICLE MATERIAL</p>
            <h2>Void 用法对应关系</h2>
          </div>
          <div className="mapping">
            <div>
              <strong>pages/index.server.ts</strong>
              <p>服务端 loader 从 D1 聚合应用和最新检测记录。</p>
            </div>
            <div>
              <strong>routes/api/check</strong>
              <p>API route 在 Worker 侧 fetch 目标 URL，并写入检测结果。</p>
            </div>
            <div>
              <strong>db/schema.ts</strong>
              <p>Drizzle D1 schema 定义 apps 与 check_runs 两张表。</p>
            </div>
            <div>
              <strong>wrangler.jsonc</strong>
              <p>Cloudflare Worker、D1 绑定和自定义域名仍由 Wrangler 管理。</p>
            </div>
          </div>
        </article>
      </section>

      <style>{styles}</style>
    </main>
  );
}

const styles = `
  :root {
    color-scheme: light;
    background: #f4f1ea;
    color: #171412;
    font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  }

  * { box-sizing: border-box; }

  body {
    margin: 0;
    background:
      linear-gradient(90deg, rgba(23, 20, 18, 0.035) 1px, transparent 1px),
      linear-gradient(rgba(23, 20, 18, 0.035) 1px, transparent 1px),
      #f4f1ea;
    background-size: 36px 36px;
  }

  a { color: inherit; }

  .page {
    width: min(1180px, calc(100% - 32px));
    margin: 0 auto;
    padding: 34px 0 56px;
  }

  .topbar {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 28px;
    align-items: end;
    padding: 28px 0 26px;
    border-bottom: 2px solid #171412;
  }

  .eyebrow, .slug {
    margin: 0;
    color: #776c61;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    font-size: 12px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
  }

  h1 {
    max-width: 920px;
    margin: 8px 0 0;
    font-family: Georgia, "Times New Roman", serif;
    font-size: clamp(44px, 8vw, 92px);
    line-height: 0.9;
    letter-spacing: 0;
  }

  .lede {
    max-width: 760px;
    margin: 18px 0 0;
    color: #514941;
    font-size: 16px;
    line-height: 1.8;
  }

  .actions {
    display: flex;
    gap: 10px;
    align-items: center;
  }

  .primaryButton, .ghostButton, button {
    min-height: 42px;
    border-radius: 8px;
    padding: 0 16px;
    border: 1px solid #171412;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-weight: 750;
    cursor: pointer;
    transition: transform 140ms ease, box-shadow 140ms ease, background 140ms ease;
  }

  .primaryButton, button.primaryButton {
    background: #171412;
    color: #fffaf0;
    box-shadow: 3px 3px 0 #d5672b;
  }

  .ghostButton {
    background: #fffaf0;
    color: #171412;
  }

  .primaryButton:active, .ghostButton:active, button:active {
    transform: scale(0.97);
  }

  .metrics {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    border: 1px solid #171412;
    border-top: 0;
    background: #fffaf0;
  }

  .metrics div {
    min-height: 112px;
    padding: 18px;
    border-right: 1px solid #d8d0c4;
  }

  .metrics div:last-child { border-right: 0; }
  .metrics span, .cardStats span {
    display: block;
    color: #776c61;
    font-size: 13px;
    margin-bottom: 10px;
  }
  .metrics strong {
    font-family: Georgia, "Times New Roman", serif;
    font-size: 38px;
    line-height: 1;
  }

  .appGrid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
    margin-top: 22px;
  }

  .appCard, .timeline, .explain {
    background: #fffaf0;
    border: 1px solid rgba(23, 20, 18, 0.22);
    box-shadow: 0 10px 24px rgba(23, 20, 18, 0.08);
  }

  .appCard {
    padding: 22px;
    border-radius: 8px;
  }

  .cardHeader {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 18px;
  }

  .appCard h2, .sectionHeader h2 {
    margin: 6px 0 0;
    font-size: 24px;
    line-height: 1.15;
  }

  .statusBadge {
    flex: none;
    border-radius: 999px;
    padding: 7px 10px;
    font-size: 12px;
    font-weight: 800;
  }

  .statusUp { background: #dff4df; color: #145c2e; }
  .statusDegraded { background: #ffe7bd; color: #7a4200; }
  .statusDown { background: #ffd7d2; color: #8f1d13; }
  .statusUnknown { background: #e8e2d7; color: #5c554b; }

  .description {
    min-height: 54px;
    color: #514941;
    line-height: 1.7;
  }

  .url {
    display: inline-flex;
    color: #b54f22;
    font-weight: 750;
    text-decoration-thickness: 1px;
    text-underline-offset: 4px;
  }

  .cardStats {
    display: grid;
    grid-template-columns: 0.7fr 1fr 1.4fr;
    gap: 10px;
    margin-top: 18px;
    padding-top: 16px;
    border-top: 1px solid #e1d9cc;
  }

  .cardStats strong {
    display: block;
    min-height: 22px;
    font-size: 14px;
  }

  .stack {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 18px;
  }

  .stack span {
    border: 1px solid #d8d0c4;
    border-radius: 999px;
    padding: 5px 9px;
    color: #514941;
    background: #f7f0e4;
    font-size: 12px;
  }

  .lowerGrid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    margin-top: 16px;
  }

  .timeline, .explain {
    border-radius: 8px;
    padding: 22px;
  }

  .timeline ol {
    display: grid;
    gap: 12px;
    list-style: none;
    padding: 0;
    margin: 18px 0 0;
  }

  .timeline li {
    display: grid;
    grid-template-columns: 12px 1fr;
    gap: 12px;
    align-items: start;
  }

  .timeline p, .mapping p, .empty {
    margin: 4px 0 0;
    color: #6b6259;
    line-height: 1.6;
    font-size: 14px;
  }

  .dot {
    width: 10px;
    height: 10px;
    border-radius: 999px;
    margin-top: 5px;
  }

  .mapping {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    margin-top: 18px;
  }

  .mapping div {
    min-height: 118px;
    padding: 14px;
    border-radius: 8px;
    background: #f7f0e4;
    border: 1px solid #e1d9cc;
  }

  @media (max-width: 860px) {
    .topbar, .lowerGrid, .appGrid, .metrics {
      grid-template-columns: 1fr;
    }

    .actions {
      align-items: stretch;
      flex-direction: column;
    }

    .metrics div {
      min-height: 88px;
      border-right: 0;
      border-bottom: 1px solid #d8d0c4;
    }

    .metrics div:last-child { border-bottom: 0; }
    .cardStats, .mapping { grid-template-columns: 1fr; }
    .description { min-height: auto; }
  }
`;
