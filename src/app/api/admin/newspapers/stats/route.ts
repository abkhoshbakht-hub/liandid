import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { tehranToday } from '@/lib/newspapers/date';

// داشبورد وضعیت ماژول روزنامه‌ها
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ success: false, message: 'غیرمجاز' }, { status: 403 });
    }
    const day = tehranToday();
    const [papers, todayIssues, archiveTotal, lastCron, recentFails] = await Promise.all([
      prisma.newspaper.findMany({ where: { active: true }, orderBy: { displayOrder: 'asc' }, select: { id: true, name: true, slug: true } }),
      prisma.newspaperIssue.findMany({ where: { date: day.utcMidnight }, select: { newspaperId: true, status: true, confidence: true } }),
      prisma.newspaperIssue.count(),
      prisma.siteSetting.findUnique({ where: { key: 'newspapers:lastCron' } }).catch(() => null),
      prisma.newspaperFetchLog.findMany({ where: { status: 'FAILED' }, orderBy: { createdAt: 'desc' }, take: 10 }),
    ]);

    const byId: Record<string, string> = Object.fromEntries(todayIssues.map((i) => [i.newspaperId, i.status]));
    const missing = papers.filter((p) => !byId[p.id]).map((p) => p.name);
    const ok = todayIssues.filter((i) => i.status === 'PUBLISHED').length;
    const review = todayIssues.filter((i) => i.status === 'NEEDS_REVIEW').length;

    const paperIds = [...new Set(recentFails.map((l) => l.newspaperId).filter(Boolean))] as string[];
    const fps = await prisma.newspaper.findMany({ where: { id: { in: paperIds } }, select: { id: true, name: true } });
    const names: Record<string, string> = Object.fromEntries(fps.map((p) => [p.id, p.name]));

    return NextResponse.json({
      success: true,
      data: {
        date: day.persian,
        total: papers.length,
        ok,
        review,
        failed: papers.length - todayIssues.length,
        missing,
        archiveTotal,
        lastCron: lastCron?.value || null,
        papers: papers.map((p) => ({ ...p, todayStatus: byId[p.id] || null })),
        recentFails: recentFails.map((l) => ({ id: l.id, paperName: l.newspaperId ? names[l.newspaperId] : '—', error: l.errorMessage, at: l.createdAt })),
      },
    });
  } catch {
    return NextResponse.json({ success: false, message: 'خطا' }, { status: 500 });
  }
}
