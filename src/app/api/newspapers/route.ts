import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { tehranToday } from '@/lib/newspapers/date';

// فهرست روزنامه‌های فعال + جلد امروز هر کدام
export const dynamic = 'force-dynamic';
export async function GET(req: Request) {
  try {
    const q = new URL(req.url).searchParams;
    const cat = q.get('category');
    const day = tehranToday();
    const papers = await prisma.newspaper.findMany({
      where: { active: true, ...(cat && ['national', 'bushehr', 'sports'].includes(cat) ? { category: cat } : {}) },
      orderBy: { displayOrder: 'asc' },
    });
    const issues = await prisma.newspaperIssue.findMany({
      where: { status: 'PUBLISHED', newspaper: { active: true } },
      select: { newspaperId: true, imageUrl: true, thumbnailUrl: true, persianDate: true, issueNumber: true, originalUrl: true, date: true },
      orderBy: { createdAt: 'desc' },
    });
    const map: Record<string, any> = {};
    for (const t of issues) {
      if (!map[t.newspaperId]) map[t.newspaperId] = t;
    }
    // REVIEW با تصویر معتبر هم قابل نمایش است (بدون Slot اضافه؛ فقط جایگزین today)
    const missingIds = papers.map((p) => p.id).filter((id) => !map[id]);
    if (missingIds.length > 0) {
      const review = await prisma.newspaperIssue.findMany({
        where: { status: 'NEEDS_REVIEW', newspaperId: { in: missingIds }, NOT: [{ imageUrl: null }, { imageUrl: '' }] },
        select: { newspaperId: true, imageUrl: true, thumbnailUrl: true, persianDate: true, issueNumber: true, originalUrl: true, date: true },
        orderBy: { createdAt: 'desc' },
      });
      for (const t of review) {
        if (!map[t.newspaperId] && t.imageUrl) map[t.newspaperId] = t;
      }
    }
    return NextResponse.json({
      success: true,
      data: { date: day.persian, papers: papers.map((p) => ({ id: p.id, name: p.name, slug: p.slug, category: p.category, website: p.website, today: map[p.id] || null })) },
    });
  } catch {
    return NextResponse.json({ success: false, message: 'خطا' }, { status: 500 });
  }
}
