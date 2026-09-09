import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { fetchAllPapers } from '@/lib/newspapers/fetcher';
import { ensureDefaultSources } from '@/lib/newspapers/ensure';
import { tehranToday } from '@/lib/newspapers/date';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

// کرون روزانه ۶ صبح تهران + اجرای دستی ادمین (?now=1 با سشن ادمین)
// محافظ: اجرای خودکار فقط اگر بیش از ۲۰ ساعت از اجرای قبلی گذشته باشد
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const manual = url.searchParams.get('now') === '1';
    let isAdmin = false;
    try {
      const session = await getServerSession(authOptions);
      isAdmin = !!session && (session.user as any).role === 'ADMIN';
    } catch {}

    if (manual && !isAdmin) {
      return NextResponse.json({ success: false, message: 'غیرمجاز' }, { status: 403 });
    }

    if (!manual) {
      // قفل ضد اجرای همزمان (۱۵ دقیقه) — جایگزین محافظ ۲۰ ساعته که اجرای ناقص را قفل می‌کرد
      const lock = await prisma.siteSetting.findUnique({ where: { key: 'newspapers:cronLock' } }).catch(() => null);
      if (lock) {
        const diffM = (Date.now() - new Date(lock.value).getTime()) / 60000;
        if (diffM < 15) {
          return NextResponse.json({ success: true, data: { skipped: true, reason: 'locked' } });
        }
      }
      await prisma.siteSetting.upsert({
        where: { key: 'newspapers:cronLock' },
        create: { key: 'newspapers:cronLock', value: new Date().toISOString() },
        update: { value: new Date().toISOString() },
      }).catch(() => null);
    }

    const day = tehranToday();
    try { await ensureDefaultSources(); } catch {}
    const results = await fetchAllPapers(day);
    const ok = results.filter((r) => r.ok && r.status !== 'SKIPPED').length;
    const failed = results.filter((r) => !r.ok).length;
    const review = results.filter((r) => r.status === 'NEEDS_REVIEW').length;

    await prisma.siteSetting
      .upsert({
        where: { key: 'newspapers:lastCron' },
        create: { key: 'newspapers:lastCron', value: new Date().toISOString() },
        update: { value: new Date().toISOString() },
      })
      .catch(() => null);

    return NextResponse.json({
      success: true,
      data: { date: day.persian, total: results.length, ok, review, failed, results },
    });
  } catch (e) {
    console.error('Newspapers cron error:', e);
    return NextResponse.json({ success: false, message: 'خطای کرون روزنامه‌ها' }, { status: 500 });
  }
}
