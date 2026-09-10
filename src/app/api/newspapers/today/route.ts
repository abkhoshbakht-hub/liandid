import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { tehranToday } from '@/lib/newspapers/date';

// جلدهای منتشرشده امروز
export const dynamic = 'force-dynamic';
export async function GET() {
  try {
    const day = tehranToday();
    const issues = await prisma.newspaperIssue.findMany({
      where: { date: day.utcMidnight, status: 'PUBLISHED', newspaper: { active: true } },
      include: { newspaper: { select: { name: true, slug: true, category: true } } },
      orderBy: { newspaper: { displayOrder: 'asc' } },
    });
    return NextResponse.json({ success: true, data: { date: day.persian, issues } });
  } catch {
    return NextResponse.json({ success: false, message: 'خطا' }, { status: 500 });
  }
}
