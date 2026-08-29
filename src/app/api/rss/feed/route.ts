import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET() {
  const siteUrl = 'https://liandid.ir';
  const siteName = 'پایگاه خبری تحلیلی لیان دید';
  const siteDesc = 'اخبار لحظه‌ای استان بوشهر و ایران';

  const articles = await prisma.article.findMany({
    where: { status: 'PUBLISHED' },
    include: { category: true, author: true, tags: true },
    orderBy: { publishedAt: 'desc' },
    take: 50,
  });

  const items = articles.map(article => {
    const pubDate = article.publishedAt
      ? article.publishedAt.toUTCString()
      : article.createdAt.toUTCString();
    const link = `${siteUrl}/news/${article.slug}`;
    const categories = article.category ? [article.category.name] : [];

    return `
    <item>
      <title>${escapeXml(article.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <description>${escapeXml(article.excerpt || article.content.slice(0, 300))}</description>
      <pubDate>${pubDate}</pubDate>
      <author>${escapeXml(article.author.name)}</author>
      ${categories.map(c => `<category>${escapeXml(c)}</category>`).join('\n      ')}
      ${article.featuredImage ? `<enclosure url="${escapeXml(article.featuredImage)}" type="image/jpeg" />` : ''}
      ${article.source ? `<source url="${escapeXml(article.sourceUrl || siteUrl)}">${escapeXml(article.source)}</source>` : ''}
    </item>`;
  }).join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:media="http://search.yahoo.com/mrss/">
  <channel>
    <title>${escapeXml(siteName)}</title>
    <link>${siteUrl}</link>
    <description>${escapeXml(siteDesc)}</description>
    <language>fa</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${siteUrl}/api/rss/feed" rel="self" type="application/rss+xml" />
    <managingEditor>admin@liandid.ir (لیان دید)</managingEditor>
    <webMaster>admin@liandid.ir (لیان دید)</webMaster>
    <copyright>Copyright ${new Date().getFullYear()} لیان دید</copyright>
    <category>اخبار</category>
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
