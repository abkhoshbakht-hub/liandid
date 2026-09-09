import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { fetchAllPapers } from '@/lib/newspapers/fetcher';
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
      const last = await prisma.siteSetting.findUnique({ where: { key: 'newspapers:lastCron' } }).catch(() => null);
      if (last) {
        const diffH = (Date.now() - new Date(last.value).getTime()) / 3600000;
        if (diffH < 20) {
          return NextResponse.json({ success: true, data: { skipped: true, reason: 'already-ran' } });
        }
      }
    }

    const day = tehranToday();
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
