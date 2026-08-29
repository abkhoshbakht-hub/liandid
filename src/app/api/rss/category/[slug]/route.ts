import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const siteUrl = 'https://liandid.ir';
  const siteName = 'پایگاه خبری تحلیلی لیان دید';

  const category = await prisma.category.findUnique({ where: { slug } });
  if (!category) {
    return NextResponse.json({ error: 'دسته‌بندی یافت نشد' }, { status: 404 });
  }

  const articles = await prisma.article.findMany({
    where: { status: 'PUBLISHED', categoryId: category.id },
    include: { author: true },
    orderBy: { publishedAt: 'desc' },
    take: 30,
  });

  const items = articles.map(article => {
    const pubDate = article.publishedAt
      ? article.publishedAt.toUTCString()
      : article.createdAt.toUTCString();
    const link = `${siteUrl}/news/${article.slug}`;

    return `
    <item>
      <title>${escapeXml(article.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <description>${escapeXml(article.excerpt || article.content.slice(0, 300))}</description>
      <pubDate>${pubDate}</pubDate>
      <author>${escapeXml(article.author.name)}</author>
      <category>${escapeXml(category.name)}</category>
      ${article.featuredImage ? `<enclosure url="${escapeXml(article.featuredImage)}" type="image/jpeg" />` : ''}
      ${article.source ? `<source url="${escapeXml(article.sourceUrl || siteUrl)}">${escapeXml(article.source)}</source>` : ''}
    </item>`;
  }).join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:media="http://search.yahoo.com/mrss/">
  <channel>
    <title>${escapeXml(siteName)} - ${escapeXml(category.name)}</title>
    <link>${siteUrl}/category/${category.slug}</link>
    <description>آخرین اخبار ${escapeXml(category.name)} از ${siteName}</description>
    <language>fa</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${siteUrl}/api/rss/category/${category.slug}" rel="self" type="application/rss+xml" />
    <managingEditor>admin@liandid.ir (لیان دید)</managingEditor>
    <copyright>Copyright ${new Date().getFullYear()} لیان دید</copyright>
    ${items}
  </channel>
</rss>`;

  return new NextResponse(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=300, s-maxage=300',
    },
  });
}
