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
    // فقط دارای تصویر
    if (searchParams.get('hasImage') === 'true') {
      where.AND = [...(where.AND || []), { NOT: [{ image: null }, { image: '' }] }];
    }
    // تاریخ انتشار مشخص (YYYY-MM-DD)
    const dateStr = searchParams.get('date');
    if (dateStr && /^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      const d = new Date(`${dateStr}T00:00:00.000Z`);
      if (!Number.isNaN(d.getTime())) {
        where.publishedAt = { gte: d, lt: new Date(d.getTime() + 86400000) };
      }
    }
    // قدیمی‌تر از X روز (Old Pending)
    const olderThan = Number(searchParams.get('olderThan') || 0);
    if (olderThan > 0) {
      where.fetchedAt = { lt: new Date(Date.now() - olderThan * 86400000) };
    }

    const [news, total] = await Promise.all([
      prisma.externalNews.findMany({
        where,
        orderBy: [{ publishedAt: { sort: 'desc', nulls: 'last' } }, { fetchedAt: 'desc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.externalNews.count({ where }),
    ]);

    const pendingCount = await prisma.externalNews.count({ where: { status: 'PENDING' } });
    // فهرست منابع برای فیلتر + آخرین وضعیت Sync
    const [sourceRows, lastSync] = await Promise.all([
      prisma.externalNews.findMany({ select: { sourceName: true }, distinct: ['sourceName'], orderBy: { sourceName: 'asc' } }).catch(() => [] as { sourceName: string }[]),
      (prisma as any).rssFetchLog?.findFirst?.({ orderBy: { createdAt: 'desc' } }).catch(() => null),
    ]);

    return NextResponse.json({
      success: true,
      data: news,
      pendingCount,
      sources: sourceRows.map((s: { sourceName: string }) => s.sourceName).filter(Boolean),
      lastSync: lastSync
        ? {
            startedAt: lastSync.startedAt, finishedAt: lastSync.finishedAt, durationMs: lastSync.durationMs,
            status: lastSync.status, totalSources: lastSync.totalSources, successSources: lastSync.successSources,
            failedSources: lastSync.failedSources, newItems: lastSync.newItems, updatedItems: lastSync.updatedItems,
            errorSummary: lastSync.errorSummary, triggerType: lastSync.triggerType,
          }
        : null,
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

    try {
      const { revalidatePath } = await import('next/cache');
      revalidatePath('/');
      revalidatePath('/archive');
    } catch {}

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

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ success: false, message: 'غیرمجاز' }, { status: 403 });
    }
    const body = await req.json().catch(() => ({}));
    const ids = body?.ids;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ success: false, message: 'اطلاعات ناقص' }, { status: 400 });
    }
    const result = await prisma.externalNews.deleteMany({ where: { id: { in: ids.slice(0, 500) } } });
    try {
      const { revalidatePath } = await import('next/cache');
      revalidatePath('/');
      revalidatePath('/archive');
    } catch {}
    return NextResponse.json({ success: true, message: `${result.count} خبر حذف شد`, data: { deleted: result.count } });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'خطای داخلی سرور' },
      { status: 500 }
    );
  }
}
