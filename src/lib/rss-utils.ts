// توابع خالص موتور RSS — بدون هیچ وابستگی (تست‌پذیر با node ساده)

// خطای موقت (ارزش retry) در برابر خطای دائمی
export function isRetryableError(message: string): boolean {
  const m = (message || '').toLowerCase();
  if (/timeout|timed out|etimedout|econnreset|econnrefused|eai_again|socket hang up|fetch failed|temporar|try again/.test(m)) return true;
  const http = /http (\d+)/.exec(m);
  if (http) {
    const code = Number(http[1]);
    if (code >= 500) return true; // 5xx موقت
    return false; // 4xx دائمی
  }
  return false;
}

// exponential backoff: 1s, 2s, 4s, ...
export function backoffMs(retryIndex: number): number {
  return 1000 * 2 ** Math.max(0, retryIndex);
}

// آیا قفل با این TTL منقضی شده؟ (بازیابی قفل قدیمی)
export function isLockStale(startedAtIso: string | null | undefined, nowMs: number, ttlMs: number): boolean {
  if (!startedAtIso) return true;
  const t = new Date(startedAtIso).getTime();
  if (Number.isNaN(t)) return true;
  return nowMs - t >= ttlMs;
}
