import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { tehranToday } from '@/lib/newspapers/date';

// فهرست روزنامه‌های فعال + جلد امروز هر کدام
export const dynamic = 'force-dynamic';
export async function GET() {
  try {
    const day = tehranToday();
    const papers = await prisma.newspaper.findMany({ where: { active: true }, orderBy: { displayOrder: 'asc' } });
    const issues = await prisma.newspaperIssue.findMany({
      where: { status: 'PUBLISHED', newspaper: { active: true } },
      select: { newspaperId: true, imageUrl: true, thumbnailUrl: true, persianDate: true, issueNumber: true },
      orderBy: { createdAt: 'desc' },
    });
    const map: Record<string, any> = {};
    for (const t of issues) {
      if (!map[t.newspaperId]) map[t.newspaperId] = t;
    }
    return NextResponse.json({
      success: true,
      data: { date: day.persian, papers: papers.map((p) => ({ id: p.id, name: p.name, slug: p.slug, category: p.category, website: p.website, today: map[p.id] || null })) },
    });
  } catch {
    return NextResponse.json({ success: false, message: 'خطا' }, { status: 500 });
  }
}
