import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import BackToHome from '@/components/layout/BackToHome';
import BushehrMap, { type CityNews } from '@/components/news/BushehrMap';

export const dynamic = 'force-dynamic';

const allCityKeywords = [
  'بوشهر', 'بندر بوشهر', 'خارگ', 'جزیره خارگ',
  'دیر', 'بندر دیر', 'بردخون', 'آبدان',
  'دیلم', 'بندر امام حسن',
  'گناوه', 'بندر گناوه', 'ریگ',
  'برازجان', 'آب‌پخش', 'بوشکان', 'تنگ ارم', 'سعدآباد', 'شبانکاره', 'دلوار', 'کلمه',
  'خورموج', 'کاکی', 'شنبه', 'بوالخیر', 'طسوج',
  'اهرم', 'کنگان', 'بندر کنگان', 'سیراف', 'بنک',
  'عسلویه', 'نخل تقی', 'بندر عسلویه',
  'جم', 'شهر جم', 'انارستان', 'ریز',
];

export default async function CitiesPage() {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const keywordOr = allCityKeywords.map(k => ({ title: { contains: k } }));

  const [keywordNews, regionNews, booshehrCatNews] = await Promise.all([
    prisma.externalNews.findMany({
      where: { status: 'APPROVED', OR: keywordOr, publishedAt: { gte: thirtyDaysAgo } },
      orderBy: { publishedAt: 'desc' },
      take: 60,
      select: {
        id: true, title: true, link: true, description: true, image: true,
        sourceName: true, category: true, publishedAt: true, region: true,
      },
    }),
    prisma.externalNews.findMany({
      where: { status: 'APPROVED', region: { not: null }, publishedAt: { gte: thirtyDaysAgo } },
      orderBy: { publishedAt: 'desc' },
      take: 60,
      select: {
        id: true, title: true, link: true, description: true, image: true,
        sourceName: true, category: true, publishedAt: true, region: true,
      },
    }),
    prisma.externalNews.findMany({
      where: { status: 'APPROVED', category: 'بوشهر', publishedAt: { gte: thirtyDaysAgo } },
      orderBy: { publishedAt: 'desc' },
      take: 60,
      select: {
        id: true, title: true, link: true, description: true, image: true,
        sourceName: true, category: true, publishedAt: true, region: true,
      },
    }),
  ]);

  const seen = new Set<string>();
  const news: CityNews[] = [];
  for (const n of [...keywordNews, ...regionNews, ...booshehrCatNews]) {
    if (!seen.has(n.id)) {
      seen.add(n.id);
      news.push({
        ...n,
        description: n.description,
        image: n.image,
        category: n.category,
        region: n.region,
        publishedAt: n.publishedAt ? n.publishedAt.toISOString() : null,
      });
    }
  }

  return (
    <>
      <Header />
      <main className="min-h-screen">
        <section className="relative bg-gradient-to-l from-[#1B365D] to-[#2E5090] overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-0 left-1/4 w-64 h-64 bg-[#C9A96E]/8 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-2xl" />
          </div>
          <div className="site-container relative z-10 py-6 md:py-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 md:w-14 md:h-14 bg-[#C9A96E]/15 backdrop-blur-sm rounded-xl flex items-center justify-center border border-[#C9A96E]/20">
                  <span className="text-2xl md:text-3xl">🏙️</span>
                </div>
                <div>
                  <h1 className="text-xl md:text-2xl font-black text-white">
                    شهرهای استان <span className="text-[#C9A96E]">بوشهر</span>
                  </h1>
                  <p className="text-white/50 text-xs mt-0.5">آخرین اخبار ۷ روز اخیر شهرهای استان بوشهر</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-2 bg-white/10 text-white text-xs px-3 py-1.5 rounded-full border border-white/10">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                  {news.length} خبر
                </span>
                <nav className="hidden md:flex items-center gap-1.5 text-xs text-white/40">
                  <Link href="/" className="hover:text-white transition-colors">خانه</Link>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                  <Link href="/category/bushahr" className="hover:text-white transition-colors">بوشهر</Link>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                  <span className="text-[#C9A96E] font-bold">شهرها</span>
                </nav>
              </div>
            </div>
          </div>
        </section>

        <div className="site-container py-8">
          <BushehrMap news={news} />
        </div>
      </main>
      <BackToHome />
      <Footer />
    </>
  );
}
