import { NextResponse } from 'next/server';
import { fetchAllRssFeeds, runRssMaintenance } from '@/lib/rss-fetcher';
import { checkRefreshAuth } from '@/lib/rss-auth';
import { acquireRssLock, releaseRssLock } from '@/lib/rss-lock';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// POST /api/rss/refresh — اجرای Fetch (فقط ادمین یا secret کرون)
// body: { maintenance?: boolean } — نگهداری مستقل از مسیر Fetch
export async function POST(req: Request) {
  const actor = await checkRefreshAuth(req);
  if (actor === 'none') {
    return NextResponse.json({ success: false, message: 'غیرمجاز' }, { status: 401 });
  }
  let maintenance = false;
  try {
    const body = await req.json().catch(() => ({}));
    maintenance = body?.maintenance === true;
  } catch {}
  if (maintenance) {
    const r = await runRssMaintenance().catch(() => ({ fixed: 0 }));
    return NextResponse.json({ success: true, data: { maintenance: true, ...r } });
  }
  const lock = await acquireRssLock();
  if (!lock.acquired) {
    return NextResponse.json({ success: true, data: { skipped: true, reason: 'locked', staleRecovered: lock.staleRecovered } });
  }
  try {
    const summary = await fetchAllRssFeeds({ triggerType: actor === 'admin' ? 'admin' : 'cron' });
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
