import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ success: false, message: 'غیرمجاز' }, { status: 403 });
    }

    const { articleId, platforms } = await req.json();

    if (!articleId || !platforms || !Array.isArray(platforms) || platforms.length === 0) {
      return NextResponse.json({ success: false, message: 'پارامترها نامعتبر' }, { status: 400 });
    }

    const article = await prisma.article.findUnique({
      where: { id: articleId },
      include: { category: { select: { name: true } } },
    });

    if (!article) {
      return NextResponse.json({ success: false, message: 'خبر یافت نشد' }, { status: 404 });
    }

    const { postToBale, postToRubika } = await import('@/lib/social-poster');
    const results = [];

    for (const platform of platforms) {
      let result;
      if (platform === 'bale') {
        result = await postToBale(article.title, article.category?.name || null, article.excerpt || null, article.slug);
      } else if (platform === 'rubika') {
        result = await postToRubika(article.title, article.category?.name || null, article.excerpt || null, article.slug);
      } else {
        result = { platform, success: false, error: 'پلتفرم ناشناخته' };
      }
      results.push(result);
    }

    return NextResponse.json({ success: true, data: results });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'خطای داخلی سرور' }, { status: 500 });
  }
}
