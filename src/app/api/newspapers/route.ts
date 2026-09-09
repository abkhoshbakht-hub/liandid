import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { tehranToday } from '@/lib/newspapers/date';

// فهرست روزنامه‌های فعال + جلد امروز هر کدام
export async function GET() {
  try {
    const day = tehranToday();
    const papers = await prisma.newspaper.findMany({ where: { active: true }, orderBy: { displayOrder: 'asc' } });
    const today = await prisma.newspaperIssue.findMany({
      where: { date: day.utcMidnight, status: 'PUBLISHED' },
      select: { newspaperId: true, imageUrl: true, thumbnailUrl: true, persianDate: true, issueNumber: true },
    });
    const map: Record<string, any> = Object.fromEntries(today.map((t) => [t.newspaperId, t]));
    return NextResponse.json({
      success: true,
      data: { date: day.persian, papers: papers.map((p) => ({ id: p.id, name: p.name, slug: p.slug, category: p.category, website: p.website, today: map[p.id] || null })) },
    });
  } catch {
    return NextResponse.json({ success: false, message: 'خطا' }, { status: 500 });
  }
}
