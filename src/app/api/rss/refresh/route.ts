import { NextResponse, after } from 'next/server';
import { fetchAllRssFeeds, runRssMaintenance } from '@/lib/rss-fetcher';
import { checkRefreshAuth } from '@/lib/rss-auth';
import { acquireRssLock, releaseRssLock } from '@/lib/rss-lock';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

async function runFetchInBackground(triggerType: string, runId: string): Promise<void> {
  try {
    const summary = await fetchAllRssFeeds({ triggerType });
    if (summary.newItems > 0) {
      try {
        const { revalidatePath } = await import('next/cache');
        revalidatePath('/');
      } catch {}
    }
  } catch {}
  finally {
    await releaseRssLock(runId).catch(() => {});
  }
}

// POST /api/rss/refresh — اجرای Fetch (فقط ادمین یا secret کرون)
// body/query: { maintenance?: boolean, background?: boolean }
// حالت background برای schedulerهایی با timeout کوتاه (مثل ۳۰ ثانیه):
// بلافاصله 200 برمی‌گرداند و Fetch در پس‌زمینه با همان Lock اجرا می‌شود.
// نتیجه واقعی در RssFetchLog و نوار مانیتورینگ داشبورد قابل مشاهده است.
export async function POST(req: Request) {
  const actor = await checkRefreshAuth(req);
  if (actor === 'none') {
    return NextResponse.json({ success: false, message: 'غیرمجاز' }, { status: 401 });
  }
  let maintenance = false;
  let background: boolean | undefined;
  try {
    const body = await req.json().catch(() => ({}));
    maintenance = body?.maintenance === true;
    if (typeof body?.background === 'boolean') background = body.background;
  } catch {}
  try {
    const q = new URL(req.url).searchParams.get('background');
    if (q === 'true') background = true;
    else if (q === 'false') background = false;
  } catch {}
  // پیش‌فرض: schedulerها (غیرادمین) پاسخ فوری می‌گیرند تا به timeout نخورند؛
  // ادمین داشبورد نتیجه کامل می‌خواهد پس sync می‌ماند. نتیجه واقعی همیشه در لاگ است.
  if (background === undefined) background = actor !== 'admin';
  if (maintenance) {
    const r = await runRssMaintenance().catch(() => ({ fixed: 0 }));
    return NextResponse.json({ success: true, data: { maintenance: true, ...r } });
  }
  const lock = await acquireRssLock();
  if (!lock.acquired) {
    return NextResponse.json({ success: true, data: { skipped: true, reason: 'locked', staleRecovered: lock.staleRecovered } });
  }
  const triggerType = actor === 'admin' ? 'admin' : 'cron';
  if (background) {
    try {
      after(() => runFetchInBackground(triggerType, lock.runId));
    } catch {
      await releaseRssLock(lock.runId).catch(() => {});
      return NextResponse.json({ success: false, message: 'خطا در شروع پس‌زمینه' }, { status: 500 });
    }
    return NextResponse.json({ success: true, data: { started: true, runId: lock.runId } });
  }
  try {
    const summary = await fetchAllRssFeeds({ triggerType });
    if (summary.newItems > 0) {
      try {
        const { revalidatePath } = await import('next/cache');
        revalidatePath('/');
      } catch {}
    }
    return NextResponse.json({ success: true, data: summary });
  } finally {
    await releaseRssLock(lock.runId);
  }
}
