import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { fetchAllRssFeeds } from '@/lib/rss-fetcher';
import { checkRefreshAuth } from '@/lib/rss-auth';
import { acquireRssLock, releaseRssLock } from '@/lib/rss-lock';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// GET: فقط خواندن (عمومی). اجرای Fetch فقط با احراز (ادمین یا secret کرون).
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const refresh = searchParams.get('refresh');

    // If refresh is requested, it requires authentication (admin or cron secret)
    if (refresh === 'true') {
      const actor = await checkRefreshAuth(request);
      if (actor === 'none') {
        return NextResponse.json({ success: false, message: 'غیرمجاز' }, { status: 401 });
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
        return NextResponse.json({ success: true, message: `${summary.saved} خبر بروزرسانی شد`, data: summary });
      } finally {
        await releaseRssLock(lock.runId);
      }
    }

    // Get approved news from database
    const where: any = { status: 'APPROVED' };
    if (category) where.category = category;
    const news = await prisma.externalNews.findMany({
      where,
      orderBy: { publishedAt: 'desc' },
      take: 50,
    });

    return NextResponse.json({ success: true, data: news });
  } catch (error) {
    console.error('RSS Error:', error);
    return NextResponse.json(
      { success: false, message: 'خطا در دریافت اخبار' },
      { status: 500 }
    );
  }
}
