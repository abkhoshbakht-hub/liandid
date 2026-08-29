import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const slug = req.nextUrl.searchParams.get('slug');
    if (slug) {
      const page = await prisma.staticPage.findUnique({ where: { slug } });
      return NextResponse.json({ success: true, data: page });
    }
    const pages = await prisma.staticPage.findMany({ orderBy: { updatedAt: 'desc' } });
    return NextResponse.json({ success: true, data: pages });
  } catch {
    return NextResponse.json({ success: false, message: 'خطای داخلی' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { slug, title, content, excerpt, featuredImage, authorName, authorImage } = body;
    if (!slug || !title || !content) {
      return NextResponse.json({ success: false, message: 'فیلدهای الزامی پر نشده' }, { status: 400 });
    }
    const page = await prisma.staticPage.upsert({
      where: { slug },
      update: { title, content, excerpt, featuredImage, authorName, authorImage },
      create: { slug, title, content, excerpt, featuredImage, authorName, authorImage },
    });
    return NextResponse.json({ success: true, data: page });
  } catch {
    return NextResponse.json({ success: false, message: 'خطای داخلی' }, { status: 500 });
  }
}
