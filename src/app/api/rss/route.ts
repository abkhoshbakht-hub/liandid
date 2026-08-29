import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { fetchAllRssFeeds } from '@/lib/rss-fetcher';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const refresh = searchParams.get('refresh');

    // If refresh is requested, fetch all feeds
    if (refresh === 'true') {
      const saved = await fetchAllRssFeeds();
      return NextResponse.json({ success: true, message: `${saved} خبر بروزرسانی شد` });
    }

    // Get approved news from database
    const where: any = { status: 'APPROVED' };
    if (category) where.category = category;
    const news = await prisma.externalNews.findMany({
      where,
      orderBy: { publishedAt: 'desc' },
      take: 50,
    });

    return NextResponse.json({ success: true, data: news });
  } catch (error) {
    console.error('RSS Error:', error);
    return NextResponse.json(
      { success: false, message: 'خطا در دریافت اخبار' },
      { status: 500 }
    );
  }
}
