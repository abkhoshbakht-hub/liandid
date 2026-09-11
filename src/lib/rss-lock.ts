import { prisma } from './prisma';
import { isLockStale as isStale } from './rss-utils';

// قفل DB برای جلوگیری از اجرای همزمان Fetch — با TTL و بازیابی خودکار قفل قدیمی.
export const RSS_LOCK_KEY = 'rss:fetchLock';
export const RSS_LOCK_TTL_MS = 5 * 60 * 1000; // 5 دقیقه (سقف اجرای Vercel بسیار کمتر است)

export interface RssLockValue {
  startedAt: string; // ISO
  runId: string;
}

// خالص و تست‌پذیر: آیا قفل با این TTL منقضی شده؟
export function isLockStale(value: RssLockValue | null | undefined, nowMs: number, ttlMs: number = RSS_LOCK_TTL_MS): boolean {
  return isStale(value?.startedAt, nowMs, ttlMs);
}

function parseLock(raw: string | null | undefined): RssLockValue | null {
  if (!raw) return null;
  try {
    const v = JSON.parse(raw);
    if (v && typeof v.startedAt === 'string') return v as RssLockValue;
    return null;
  } catch {
    return null;
  }
}

export async function acquireRssLock(ttlMs: number = RSS_LOCK_TTL_MS): Promise<{ acquired: boolean; staleRecovered: boolean; runId: string }> {
  const runId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  // دو تلاش برای مقاومت در برابر race همزمان (compare-and-swap)
  for (let round = 0; round < 2; round++) {
    const nowMs = Date.now();
    const value = JSON.stringify({ startedAt: new Date(nowMs).toISOString(), runId } satisfies RssLockValue);
    try {
      // ایجاد اتمیک: فقط اگر ردیفی وجود ندارد موفق می‌شود
      await prisma.siteSetting.create({ data: { key: RSS_LOCK_KEY, value } });
      return { acquired: true, staleRecovered: false, runId };
    } catch {
      // ردیف وجود دارد — بررسی تازگی
    }
    const row = await prisma.siteSetting.findUnique({ where: { key: RSS_LOCK_KEY } }).catch(() => null);
    const current = parseLock(row?.value);
    if (current && !isLockStale(current, nowMs, ttlMs)) {
      return { acquired: false, staleRecovered: false, runId };
    }
    // قدیمی/خراب است — فقط اگر هنوز همان مقدار قبلی باشد جایگزین کن (CAS)
    try {
      const updated = await prisma.siteSetting.updateMany({
        where: { key: RSS_LOCK_KEY, value: row?.value ?? '' },
        data: { value },
      });
      if (updated.count === 1) {
        return { acquired: true, staleRecovered: !!current, runId };
      }
      // باختیم در race — یک دور دیگر تلاش کن
    } catch {
      return { acquired: false, staleRecovered: false, runId };
    }
  }
  return { acquired: false, staleRecovered: false, runId };
}

export async function releaseRssLock(runId: string): Promise<void> {
  // فقط اگر قفل مال همین اجراست آزاد کن (اجرای جدیدتر را خراب نکن)
  const row = await prisma.siteSetting.findUnique({ where: { key: RSS_LOCK_KEY } }).catch(() => null);
  const current = parseLock(row?.value);
  if (current && current.runId === runId) {
    await prisma.siteSetting.delete({ where: { key: RSS_LOCK_KEY } }).catch(() => {});
  }
}
