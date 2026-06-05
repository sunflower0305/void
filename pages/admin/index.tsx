import type { Props } from "./index.server";
import { formatCheckedAt, formatLatency } from "../../src/format";

const STATUS_LABEL = {
  up: "正常",
  degraded: "异常响应",
  down: "不可达",
  unknown: "未检测",
} as const;

export default function AdminPage({ apps }: Props) {
  return (
    <main className="adminPage">
      <header className="header">
        <div>
          <p className="eyebrow">MANUAL CONTROL</p>
          <h1>应用健康看板管理台</h1>
          <p>
            第一版刻意保留手动登记和手动检测，避免 Cloudflare API Token、权限和资源同步逻辑抢走文章主线。
          </p>
        </div>
        <div className="headerActions">
          <a href="/">返回看板</a>
          <form action="/api/check" method="post">
            <button type="submit">检测全部</button>
          </form>
        </div>
      </header>

      <section className="createPanel">
        <h2>添加监控应用</h2>
        <form action="/api/apps" method="post" className="createForm">
          <input type="hidden" name="intent" value="create" />
          <label>
            名称
            <input name="name" required placeholder="例如：新 Void 应用" />
          </label>
          <label>
            Slug
            <input name="slug" required pattern="[a-z0-9-]+" placeholder="new-void-app" />
          </label>
          <label>
            URL
            <input name="url" required type="url" placeholder="https://example.com" />
          </label>
          <label className="wide">
            描述
            <input name="description" required placeholder="这个应用在文章里的角色" />
          </label>
          <label className="wide">
            技术栈
            <input name="stack" required placeholder="Void, React, D1, Cloudflare Workers" />
          </label>
          <button type="submit">添加应用</button>
        </form>
      </section>

      <section className="tablePanel">
        <div className="panelHeader">
          <h2>监控目标</h2>
          <span>{apps.length} apps</span>
        </div>
        <div className="table">
          {apps.map((app) => (
            <article className={app.isActive ? "row" : "row inactive"} key={app.id}>
              <form action="/api/apps" method="post" className="editForm">
                <input type="hidden" name="intent" value="update" />
                <input type="hidden" name="id" value={app.id} />
                <label>
                  名称
                  <input name="name" defaultValue={app.name} required />
                </label>
                <label>
                  Slug
                  <input name="slug" defaultValue={app.slug} required pattern="[a-z0-9-]+" />
                </label>
                <label>
                  URL
                  <input name="url" defaultValue={app.url} required type="url" />
                </label>
                <label className="wide">
                  描述
                  <input name="description" defaultValue={app.description} required />
                </label>
                <label className="wide">
                  技术栈
                  <input name="stack" defaultValue={app.stack} required />
                </label>
                <label className="checkLabel">
                  <input
                    type="checkbox"
                    name="isActive"
                    value="true"
                    defaultChecked={app.isActive}
                  />
                  启用监控
                </label>
                <div className="stateLine">
                  <span>{STATUS_LABEL[app.status]}</span>
                  <span>HTTP {app.latestRun?.httpStatus ?? "-"}</span>
                  <span>{formatLatency(app.latestRun?.responseTimeMs)}</span>
                  <span>{formatCheckedAt(app.latestRun?.checkedAt)}</span>
                </div>
                <div className="rowActions">
                  <button type="submit">保存</button>
                </div>
              </form>
              <form action={`/api/check/${app.slug}`} method="post" className="checkForm">
                <button type="submit" disabled={!app.isActive}>
                  单独检测
                </button>
              </form>
            </article>
          ))}
        </div>
      </section>
      <style>{styles}</style>
    </main>
  );
}

const styles = `
  :root {
    background: #f4f1ea;
    color: #171412;
    font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  }

  * { box-sizing: border-box; }
  body { margin: 0; background: #f4f1ea; }

  .adminPage {
    width: min(1180px, calc(100% - 32px));
    margin: 0 auto;
    padding: 34px 0 56px;
  }

  .header {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 24px;
    align-items: end;
    padding-bottom: 24px;
    border-bottom: 2px solid #171412;
  }

  .eyebrow {
    margin: 0;
    color: #776c61;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    font-size: 12px;
    letter-spacing: 0.14em;
  }

  h1 {
    margin: 8px 0 0;
    font-family: Georgia, "Times New Roman", serif;
    font-size: clamp(38px, 7vw, 76px);
    line-height: 0.92;
    letter-spacing: 0;
  }

  .header p {
    max-width: 760px;
    color: #514941;
    line-height: 1.75;
  }

  .headerActions {
    display: flex;
    gap: 10px;
    align-items: center;
  }

  a, button {
    min-height: 42px;
    border-radius: 8px;
    padding: 0 16px;
    border: 1px solid #171412;
    background: #fffaf0;
    color: #171412;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    text-decoration: none;
    font-weight: 750;
    cursor: pointer;
    transition: transform 140ms ease, box-shadow 140ms ease, background 140ms ease;
  }

  button {
    background: #171412;
    color: #fffaf0;
    box-shadow: 3px 3px 0 #d5672b;
  }

  button:disabled {
    cursor: not-allowed;
    opacity: 0.45;
    box-shadow: none;
  }

  a:active, button:active {
    transform: scale(0.97);
  }

  .createPanel, .tablePanel {
    margin-top: 18px;
    padding: 22px;
    border: 1px solid rgba(23, 20, 18, 0.22);
    border-radius: 8px;
    background: #fffaf0;
    box-shadow: 0 10px 24px rgba(23, 20, 18, 0.08);
  }

  h2 {
    margin: 0 0 16px;
    font-size: 22px;
  }

  .createForm, .editForm {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
  }

  label {
    display: grid;
    gap: 6px;
    color: #6b6259;
    font-size: 13px;
    font-weight: 700;
  }

  input {
    width: 100%;
    min-height: 42px;
    border: 1px solid #d8d0c4;
    border-radius: 8px;
    padding: 0 11px;
    background: #f7f0e4;
    color: #171412;
    font: inherit;
  }

  input:focus {
    outline: 3px solid rgba(213, 103, 43, 0.22);
    border-color: #d5672b;
  }

  .wide {
    grid-column: span 2;
  }

  .panelHeader {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
  }

  .panelHeader span {
    color: #776c61;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    font-size: 12px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .table {
    display: grid;
    gap: 12px;
  }

  .row {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 12px;
    padding: 14px;
    border: 1px solid #e1d9cc;
    border-radius: 8px;
    background: #f7f0e4;
  }

  .row.inactive {
    opacity: 0.65;
  }

  .checkLabel {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 8px;
    color: #171412;
  }

  .checkLabel input {
    width: 18px;
    min-height: 18px;
  }

  .stateLine {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
  }

  .stateLine span {
    border: 1px solid #d8d0c4;
    border-radius: 999px;
    padding: 6px 9px;
    background: #fffaf0;
    color: #514941;
    font-size: 12px;
  }

  .rowActions, .checkForm {
    display: flex;
    align-items: end;
  }

  @media (max-width: 920px) {
    .header, .row, .createForm, .editForm {
      grid-template-columns: 1fr;
    }

    .headerActions {
      align-items: stretch;
      flex-direction: column;
    }

    .wide {
      grid-column: auto;
    }

    .checkForm button {
      width: 100%;
    }
  }
`;
