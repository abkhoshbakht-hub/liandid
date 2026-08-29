import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ success: false, message: 'غیرمجاز' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');
    const category = searchParams.get('category');

    const where: any = { status: 'APPROVED' };
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { sourceName: { contains: search } },
      ];
    }
    if (category) where.category = category;

    const news = await prisma.externalNews.findMany({
      where,
      select: {
        id: true,
        title: true,
        sourceName: true,
        category: true,
        image: true,
        publishedAt: true,
        description: true,
      },
      orderBy: { publishedAt: 'desc' },
      take: 50,
    });

    return NextResponse.json({ success: true, data: news });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'خطای داخلی سرور' }, { status: 500 });
  }
}
