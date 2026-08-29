import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ success: false, message: 'غیرمجاز' }, { status: 403 });
    }

    const slots = await prisma.homepageSlot.findMany({
      include: {
        externalNews: {
          select: { id: true, title: true, sourceName: true, category: true, image: true, publishedAt: true },
        },
      },
      orderBy: { order: 'asc' },
    });

    return NextResponse.json({ success: true, data: slots });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'خطای داخلی سرور' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ success: false, message: 'غیرمجاز' }, { status: 403 });
    }

    const body = await req.json();
    const { id, type, externalNewsId, customTitle, customContent, customImage, customLink, category, isActive } = body;

    if (!id) {
      return NextResponse.json({ success: false, message: 'شناسه الزامی است' }, { status: 400 });
    }

    const data: any = {};
    if (type !== undefined) data.type = type;
    if (externalNewsId !== undefined) data.externalNewsId = externalNewsId || null;
    if (customTitle !== undefined) data.customTitle = customTitle || null;
    if (customContent !== undefined) data.customContent = customContent || null;
    if (customImage !== undefined) data.customImage = customImage || null;
    if (customLink !== undefined) data.customLink = customLink || null;
    if (category !== undefined) data.category = category || null;
    if (isActive !== undefined) data.isActive = isActive;

    const slot = await prisma.homepageSlot.update({ where: { id }, data });

    // Archive custom news to articles table
    if (type === 'CUSTOM' && customTitle) {
      const customCat = await prisma.category.findFirst({ where: { slug: 'custom-news' } });
      const slug = `custom-${Date.now()}`;
      const existingArticle = await prisma.article.findFirst({ where: { metaDesc: `homepage-slot:${id}` } });
      if (existingArticle) {
        await prisma.article.update({ where: { id: existingArticle.id }, data: { title: customTitle, content: customContent || '', excerpt: customContent || null, featuredImage: customImage || null, sourceUrl: customLink || null } });
      } else {
        await prisma.article.create({ data: { title: customTitle, slug, content: customContent || '', excerpt: customContent || null, featuredImage: customImage || null, sourceUrl: customLink || null, status: 'PUBLISHED', source: 'خبر اختصاصی لیان دید', authorId: (session.user as any).id, categoryId: customCat?.id || null, metaDesc: `homepage-slot:${id}` } });
      }
    }

    return NextResponse.json({ success: true, data: slot });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'خطای داخلی سرور' }, { status: 500 });
  }
}
