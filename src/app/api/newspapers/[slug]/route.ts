import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { tehranToday } from '@/lib/newspapers/date';

// صفحه یک روزنامه: مشخصات + جلد امروز + ۱۲ شماره اخیر
export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const paper = await prisma.newspaper.findFirst({ where: { slug, active: true } });
    if (!paper) return NextResponse.json({ success: false, message: 'روزنامه یافت نشد' }, { status: 404 });
    const day = tehranToday();
    const recent = await prisma.newspaperIssue.findMany({ where: { newspaperId: paper.id, status: 'PUBLISHED' }, orderBy: { createdAt: 'desc' }, take: 12 });
    const today = recent[0] || null;
    return NextResponse.json({ success: true, data: { paper, today, recent, todayDate: day.persian } });
  } catch {
    return NextResponse.json({ success: false, message: 'خطا' }, { status: 500 });
  }
}
