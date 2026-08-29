import { fetchAllRssFeeds } from './rss-fetcher';

let intervalId: ReturnType<typeof setInterval> | null = null;
let isRunning = false;

export async function runRssFetch(): Promise<number> {
  if (isRunning) {
    console.log('[RSS Scheduler] قبلاً در حال اجراست، رد شد');
    return 0;
  }

  isRunning = true;
  const startTime = Date.now();

  try {
    console.log('[RSS Scheduler] شروع دریافت اخبار...');
    const count = await fetchAllRssFeeds();
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`[RSS Scheduler] ${count} خبر جدید در ${elapsed} ثانیه`);
    return count;
  } catch (error) {
    console.error('[RSS Scheduler] خطا:', error);
    return 0;
  } finally {
    isRunning = false;
  }
}

export function startRssScheduler(intervalMinutes: number = 10) {
  if (intervalId) {
    console.log('[RSS Scheduler] قبلاً فعال است');
    return;
  }

  console.log(`[RSS Scheduler] فعال شد - هر ${intervalMinutes} دقیقه`);

  // اجرای اولیه بعد از ۳۰ ثانیه
  setTimeout(() => {
    runRssFetch();
  }, 30000);

  // اجرای دوره‌ای
  intervalId = setInterval(() => {
    runRssFetch();
  }, intervalMinutes * 60 * 1000);
}

export function stopRssScheduler() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
    console.log('[RSS Scheduler] متوقف شد');
  }
}
