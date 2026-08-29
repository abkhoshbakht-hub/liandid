import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const article = await prisma.article.findUnique({
      where: {
        slug,
        status: 'PUBLISHED',
      },
      include: {
        author: {
          select: { id: true, name: true, avatar: true, bio: true },
        },
        category: {
          select: { id: true, name: true, slug: true, color: true },
        },
        tags: {
          select: { id: true, name: true, slug: true },
        },
        comments: {
          where: { approved: true },
          include: {
            user: {
              select: { id: true, name: true, avatar: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!article) {
      return NextResponse.json(
        { success: false, message: 'مقاله یافت نشد' },
        { status: 404 }
      );
    }

    await prisma.article.update({
      where: { id: article.id },
      data: { viewCount: { increment: 1 } },
    });

    const relatedArticles = await prisma.article.findMany({
      where: {
        status: 'PUBLISHED',
        categoryId: article.categoryId,
        id: { not: article.id },
      },
      include: {
        author: { select: { name: true } },
        category: { select: { name: true, slug: true } },
      },
      take: 4,
      orderBy: { publishedAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: {
        ...article,
        viewCount: article.viewCount + 1,
        relatedArticles,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'خطای داخلی سرور' },
      { status: 500 }
    );
  }
}