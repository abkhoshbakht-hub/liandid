import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const article = await prisma.article.findUnique({
      where: { slug },
      select: {
        id: true,
        title: true,
        content: true,
        excerpt: true,
        featuredImage: true,
        viewCount: true,
        publishedAt: true,
        status: true,
        author: { select: { name: true, avatar: true } },
        category: { select: { name: true, slug: true, color: true } },
      },
    });

    if (!article || (article.status !== 'PUBLISHED' && article.status !== 'APPROVED')) {
      return NextResponse.json({ success: false, message: 'خبر یافت نشد' }, { status: 404 });
    }

    await prisma.article.update({
      where: { slug },
      data: { viewCount: { increment: 1 } },
    });

    const { status: _, ...articleData } = article;
    return NextResponse.json({ success: true, data: { ...articleData, viewCount: article.viewCount + 1 } });
  } catch {
    return NextResponse.json({ success: false, message: 'خطای داخلی سرور' }, { status: 500 });
  }
}
