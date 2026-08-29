import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = 'https://liandid.ir';

  const staticPages: MetadataRoute.Sitemap = [
    { url: base, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${base}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/privacy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${base}/terms`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${base}/gallery`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${base}/ostanha`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.6 },
    { url: `${base}/submit`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  ];

  try {
    const [articles, categories] = await Promise.all([
      prisma.article.findMany({
        where: { status: 'PUBLISHED' },
        select: { slug: true, updatedAt: true, publishedAt: true },
        orderBy: { publishedAt: 'desc' },
      }),
      prisma.category.findMany({
        select: { slug: true },
      }),
    ]);

    const articlePages: MetadataRoute.Sitemap = articles.map((a) => ({
      url: `${base}/news/${a.slug}`,
      lastModified: a.updatedAt || a.publishedAt || new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    }));

    const categoryPages: MetadataRoute.Sitemap = categories
      .filter((c) => !['gallery', 'ostanha'].includes(c.slug))
      .map((c) => ({
        url: `${base}/category/${c.slug}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.8,
      }));

    return [...staticPages, ...articlePages, ...categoryPages];
  } catch {
    return staticPages;
  }
}
