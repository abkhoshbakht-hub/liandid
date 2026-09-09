import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// لاگ‌های دریافت (فیلتر status: FAILED / NEEDS... / همه)
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ success: false, message: 'غیرمجاز' }, { status: 403 });
    }
    const q = new URL(req.url).searchParams;
    const where: any = {};
    if (q.get('status')) where.status = q.get('status');
    if (q.get('newspaperId')) where.newspaperId = q.get('newspaperId');
    const limit = Math.min(200, Number(q.get('limit')) || 50);
    const logs = await prisma.newspaperFetchLog.findMany({
      where, orderBy: { createdAt: 'desc' }, take: limit,
    });
    const paperIds = [...new Set(logs.map((l) => l.newspaperId).filter(Boolean))] as string[];
    const papers = await prisma.newspaper.findMany({ where: { id: { in: paperIds } }, select: { id: true, name: true } });
    const names: Record<string, string> = Object.fromEntries(papers.map((p) => [p.id, p.name]));
    return NextResponse.json({ success: true, data: logs.map((l) => ({ ...l, paperName: l.newspaperId ? names[l.newspaperId] : null })) });
  } catch {
    return NextResponse.json({ success: false, message: 'خطا' }, { status: 500 });
  }
}
