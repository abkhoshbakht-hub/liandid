import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !['ADMIN', 'AUTHOR'].includes((session.user as any).role)) {
      return NextResponse.json(
        { success: false, message: 'غیرمجاز' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      title, subtitle, content, excerpt, categoryId, featuredImage,
      status, isFeatured, isBreaking, isPinned, placement, source, sourceUrl,
      scheduledAt, metaTitle, metaDesc, metaKeywords, tagIds
    } = body;

    if (!title || !content) {
      return NextResponse.json(
        { success: false, message: 'عنوان و محتوا الزامی است' },
        { status: 400 }
      );
    }

    let slug = title
      .replace(/[^a-zA-Z0-9\u0600-\u06FF\s]/g, '')
      .replace(/\s+/g, '-')
      .toLowerCase();

    const existingSlug = await prisma.article.findFirst({ where: { slug } });
    if (existingSlug) {
      slug = `${slug}-${Date.now()}`;
    }

    // Check permissions for AUTHOR
    let finalStatus = status || 'DRAFT';
    const userRole = (session.user as any).role;
    if (userRole === 'AUTHOR') {
      const author = await prisma.user.findUnique({
        where: { id: (session.user as any).id },
        select: { permissions: true },
      });
      const perms: string[] = JSON.parse(author?.permissions || '[]');
      if (!perms.includes('publish')) {
        finalStatus = 'PENDING';
      }
    }

    const article = await prisma.article.create({
      data: {
        title,
        slug,
        subtitle: subtitle || null,
        content,
        excerpt: excerpt || null,
        featuredImage: featuredImage || null,
        status: userRole === 'ADMIN' ? (status || 'DRAFT') : finalStatus,
        isFeatured: isFeatured || false,
        isBreaking: isBreaking || false,
        isPinned: isPinned || false,
        placement: placement || 'latest',
        source: source || null,
        sourceUrl: sourceUrl || null,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        metaTitle: metaTitle || null,
        metaDesc: metaDesc || null,
        metaKeywords: metaKeywords || null,
        authorId: (session.user as any).id,
        categoryId: categoryId || null,
        tags: tagIds ? { connect: tagIds.map((id: string) => ({ id })) } : undefined,
      },
      include: {
        author: { select: { id: true, name: true } },
        category: { select: { id: true, name: true } },
        tags: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'خبر با موفقیت ایجاد شد',
      data: article,
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'خطای داخلی سرور' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !['ADMIN', 'AUTHOR'].includes((session.user as any).role)) {
      return NextResponse.json(
        { success: false, message: 'غیرمجاز' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');
    const categoryId = searchParams.get('categoryId');
    const search = searchParams.get('search');
    const region = searchParams.get('region');

    const where: any = {};
    
    if ((session.user as any).role === 'AUTHOR') {
      where.authorId = (session.user as any).id;
    }
    
    if (status) where.status = status;
    if (categoryId) where.categoryId = categoryId;
    if (region !== null && region !== undefined) {
      where.region = region;
    }
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { content: { contains: search } },
      ];
    }

    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where,
        include: {
          author: { select: { id: true, name: true } },
          category: { select: { id: true, name: true, slug: true } },
          tags: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.article.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: articles,
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
