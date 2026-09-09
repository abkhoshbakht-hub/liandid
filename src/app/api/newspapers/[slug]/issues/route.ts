import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// شماره‌های یک روزنامه با صفحه‌بندی
export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const paper = await prisma.newspaper.findFirst({ where: { slug, active: true }, select: { id: true } });
    if (!paper) return NextResponse.json({ success: false, message: 'روزنامه یافت نشد' }, { status: 404 });
    const page = Math.max(1, Number(new URL(req.url).searchParams.get('page')) || 1);
    const per = 24;
    const where = { newspaperId: paper.id, status: 'PUBLISHED' };
    const [total, items] = await Promise.all([
      prisma.newspaperIssue.count({ where }),
      prisma.newspaperIssue.findMany({ where, orderBy: { date: 'desc' }, skip: (page - 1) * per, take: per }),
    ]);
    return NextResponse.json({ success: true, data: { items, total, page, pages: Math.ceil(total / per) } });
  } catch {
    return NextResponse.json({ success: false, message: 'خطا' }, { status: 500 });
  }
}
