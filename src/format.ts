export function splitStack(stack: string) {
  return stack
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function formatLatency(ms: number | null | undefined) {
  if (typeof ms !== "number") return "未检测";
  if (ms >= 1000) return `${(ms / 1000).toFixed(2)}s`;
  return `${ms}ms`;
}

export function formatCheckedAt(value: string | null | undefined) {
  if (!value) return "尚未检测";
  return value.replace("T", " ").replace(".000Z", " UTC");
}
