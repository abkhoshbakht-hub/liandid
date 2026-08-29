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
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');
    const source = searchParams.get('source');
    const breaking = searchParams.get('breaking');

    const where: any = {};
    if (status) where.status = status;
    if (source) where.sourceName = source;
    if (breaking === 'true') where.isBreaking = true;

    const region = searchParams.get('region');
    const search = searchParams.get('search');
    if (region) where.region = region;
    if (search) where.title = { contains: search };

    const [news, total] = await Promise.all([
      prisma.externalNews.findMany({
        where,
        orderBy: { fetchedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.externalNews.count({ where }),
    ]);

    const pendingCount = await prisma.externalNews.count({ where: { status: 'PENDING' } });

    return NextResponse.json({
      success: true,
      data: news,
      pendingCount,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'خطای داخلی سرور' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ success: false, message: 'غیرمجاز' }, { status: 403 });
    }

    const body = await req.json();
    const { ids, status, isBreaking, region } = body;

    if (!ids || !Array.isArray(ids)) {
      return NextResponse.json(
        { success: false, message: 'اطلاعات ناقص' },
        { status: 400 }
      );
    }

    const data: any = {};
    if (status) {
      if (!['APPROVED', 'REJECTED', 'PENDING'].includes(status)) {
        return NextResponse.json(
          { success: false, message: 'وضعیت نامعتبر' },
          { status: 400 }
        );
      }
      data.status = status;
    }
    if (typeof isBreaking === 'boolean') {
      data.isBreaking = isBreaking;
    }
    if (region !== undefined) {
      // "jam:city" برای اختصاص، "" یا null برای حذف از بخش
      data.region = region || null;
    }

    const result = await prisma.externalNews.updateMany({
      where: { id: { in: ids } },
      data,
    });

    return NextResponse.json({
      success: true,
      message: `${result.count} خبر بروزرسانی شد`,
      data: { updated: result.count },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'خطای داخلی سرور' },
      { status: 500 }
    );
  }
}
