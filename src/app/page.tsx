import { prisma } from '@/lib/prisma';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/news/HeroSection';
import LatestNews from '@/components/news/LatestNews';
import AnalysisSection from '@/components/news/AnalysisSection';
import RssNewsFeed from '@/components/news/RssNewsFeed';
import SubmitBanner from '@/components/home/SubmitBanner';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: 'لیان دید | پایگاه خبری تحلیلی استان بوشهر',
    template: '%s | لیان دید',
  },
  description: 'پایگاه خبری تحلیلی لیان دید - اخبار لحظه‌ای استان بوشهر و ایران با پروانه انتشار ۹۶۲۲',
  keywords: ['خبر', 'تحلیل', 'بوشهر', 'ایران', 'اخبار سیاسی', 'اخبار اقتصادی'],
  openGraph: { title: 'لیان دید | پایگاه خبری تحلیلی استان بوشهر', description: 'اخبار لحظه‌ای استان بوشهر و ایران', type: 'website', url: 'https://liandid.ir', siteName: 'لیان دید', locale: 'fa_IR', images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'لیان دید' }] },
  twitter: { card: 'summary_large_image', title: 'لیان دید', description: 'پایگاه خبری تحلیلی استان بوشهر', images: ['/og-image.png'] },
  alternates: { canonical: 'https://liandid.ir' },
};

async function getHomepageData() {
  try {
    const [slots, approvedNews, articles] = await Promise.all([
      prisma.homepageSlot.findMany({
        where: { isActive: true },
        include: {
          externalNews: {
            select: {
              id: true, title: true, link: true, description: true, image: true,
              source: true, sourceName: true, category: true, publishedAt: true, isBreaking: true,
            },
          },
        },
        orderBy: { order: 'asc' },
      }),
      prisma.externalNews.findMany({
        where: { status: 'APPROVED' },
        orderBy: { publishedAt: 'desc' },
        select: {
          id: true, title: true, link: true, description: true, image: true,
          source: true, sourceName: true, category: true, publishedAt: true, isBreaking: true,
        },
      }),
      prisma.article.findMany({
        where: { status: 'PUBLISHED' },
        orderBy: { publishedAt: 'desc' },
        select: {
          id: true, title: true, slug: true, excerpt: true, featuredImage: true,
          publishedAt: true, isBreaking: true, isFeatured: true,
          author: { select: { name: true } },
          category: { select: { name: true, slug: true } },
        },
      }),
    ]);

    type Item = { id: string; title: string; link: string; description: string | null; image: string | null; source: string; sourceName: string; category: string | null; publishedAt: string | null; isCustom: boolean };

    const toExternalItem = (n: typeof approvedNews[0]): Item => ({
      id: n.id, title: n.title, link: n.link, description: n.description, image: n.image,
      source: n.source, sourceName: n.sourceName, category: n.category,
      publishedAt: n.publishedAt?.toISOString() || null, isCustom: false,
    });

    const toArticleItem = (a: typeof articles[0]): Item => ({
      id: a.id, title: a.title, link: `/news/${a.slug}`, description: a.excerpt,
      image: a.featuredImage, source: a.author?.name || 'لیان دید', sourceName: 'لیان دید',
      category: a.category?.name || null,
      publishedAt: a.publishedAt?.toISOString() || null, isCustom: false,
    });

    const allNewsItems = [...articles.map(toArticleItem), ...approvedNews.map(toExternalItem)];

    const resolve = (s: { id: string; type: string; customTitle?: string | null; customLink?: string | null; customContent?: string | null; customImage?: string | null; category?: string | null; externalNews?: typeof approvedNews[0] | null } | null, fallbackItem?: Item): Item | null => {
      if (s?.type === 'CUSTOM' && s.customTitle) {
        return {
          id: s.id, title: s.customTitle, link: s.customLink || '#',
          description: s.customContent || '', image: s.customImage || '',
          source: 'لیان دید', sourceName: 'لیان دید',
          category: s.category || 'اختصاصی', publishedAt: null, isCustom: true,
        };
      }
      if (s?.type === 'EXTERNAL' && s.externalNews) {
        return toExternalItem(s.externalNews);
      }
      return fallbackItem || null;
    };

    const findSlot = (key: string) => slots.find(s => s.slotKey === key) || null;

    const heroMain = resolve(findSlot('hero-main'), allNewsItems[0] || null);
    const heroSide1 = resolve(findSlot('hero-side-1'), allNewsItems[1] || null);
    const heroSide2 = resolve(findSlot('hero-side-2'), allNewsItems[2] || null);

    const heroIds = [heroMain?.id, heroSide1?.id, heroSide2?.id].filter(Boolean);

    const articleBreaking = articles.filter(a => a.isBreaking && !heroIds.includes(a.id));
    const externalBreaking = approvedNews.filter(n => n.isBreaking && !heroIds.includes(n.id));
    const allBreakingItems = [...articleBreaking.map(toArticleItem), ...externalBreaking.map(toExternalItem)];
    const breaking = allBreakingItems.slice(0, 3);

    const breakingIds = breaking.map(b => b.id);
    const usedIds = new Set([...heroIds, ...breakingIds]);

    const latest = allNewsItems.filter(n => !usedIds.has(n.id));
    latest.forEach(n => usedIds.add(n.id));

    const analysisKeys = ['analysis-1', 'analysis-2', 'analysis-3'];
    const analysis = analysisKeys.map((k, i) => {
      const slot = findSlot(k);
      const fallbackItem = allNewsItems.filter(n => !usedIds.has(n.id))[i];
      return resolve(slot, fallbackItem);
    }).filter((item): item is Item => item !== null);

    return { heroMain, heroSide1, heroSide2, breaking, latest, analysis };
  } catch {
    return { heroMain: null, heroSide1: null, heroSide2: null, breaking: [], latest: [], analysis: [] };
  }
}

export default async function HomePage() {
  const data = await getHomepageData();

  return (
    <>
      <Header breakingItems={data.breaking.map(b => ({ id: b.id, title: b.title, link: b.link }))} />
      <main className="bg-gray-50 min-h-screen">
        <div className="site-container pt-4">
          <HeroSection main={data.heroMain} side1={data.heroSide1} side2={data.heroSide2} />

          {/* Latest News + RSS */}
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 min-h-[400px] lg:h-[600px]">
              <LatestNews items={data.latest} />
            </div>
            <div className="min-h-[400px] lg:h-[600px]">
              <RssNewsFeed />
            </div>
          </div>

          {/* Analysis */}
          <AnalysisSection items={data.analysis} />

          {/* Submit Banner */}
          <SubmitBanner />
        </div>
      </main>
      <Footer />
    </>
  );
}
