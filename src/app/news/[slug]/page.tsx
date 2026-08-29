import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import ArticleView from '@/components/news/ArticleView';

async function getArticle(slug: string) {
  try {
    const article = await prisma.article.findUnique({
      where: { slug },
      select: {
        title: true,
        excerpt: true,
        featuredImage: true,
        publishedAt: true,
        category: { select: { name: true } },
      },
    });
    return article;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) {
    return { title: 'خبر یافت نشد', robots: { index: false } };
  }

  return {
    title: article.title,
    description: article.excerpt || article.title,
    openGraph: {
      title: article.title,
      description: article.excerpt || article.title,
      type: 'article',
      url: `https://liandid.ir/news/${slug}`,
      images: article.featuredImage ? [{ url: article.featuredImage, width: 1200, height: 630, alt: article.title }] : [],
      siteName: 'لیان دید',
      locale: 'fa_IR',
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.excerpt || article.title,
      images: article.featuredImage ? [article.featuredImage] : [],
    },
    alternates: { canonical: `https://liandid.ir/news/${slug}` },
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <ArticleView slug={slug} />;
}
