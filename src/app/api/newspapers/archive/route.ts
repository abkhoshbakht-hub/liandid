import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// آرشیو: ?date=YYYY-MM-DD&paper=<slug|id>&category=national|bushehr|sports&page=
export const dynamic = 'force-dynamic';
export async function GET(req: Request) {
  try {
    const q = new URL(req.url).searchParams;
    const where: any = { status: 'PUBLISHED', newspaper: { active: true } };
    if (q.get('date') && /^\d{4}-\d{2}-\d{2}$/.test(q.get('date')!)) {
      where.date = new Date(`${q.get('date')}T00:00:00.000Z`);
    }
    const paper = q.get('paper');
    if (paper) {
      const p = await prisma.newspaper.findFirst({ where: { OR: [{ slug: paper }, { id: paper }] }, select: { id: true } });
      if (p) where.newspaperId = p.id;
    }
    if (q.get('category') && ['national', 'bushehr', 'sports'].includes(q.get('category')!)) {
      where.newspaper = { active: true, category: q.get('category') };
    }
    const page = Math.max(1, Number(q.get('page')) || 1);
    const per = 24;
    const [total, items] = await Promise.all([
      prisma.newspaperIssue.count({ where }),
      prisma.newspaperIssue.findMany({
        where,
        include: { newspaper: { select: { name: true, slug: true, category: true } } },
        orderBy: [{ date: 'desc' }, { newspaper: { displayOrder: 'asc' } }],
        skip: (page - 1) * per,
        take: per,
      }),
    ]);
    return NextResponse.json({ success: true, data: { items, total, page, pages: Math.ceil(total / per) } });
  } catch {
    return NextResponse.json({ success: false, message: 'خطا' }, { status: 500 });
  }
}
