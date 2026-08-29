import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import BackToHome from '@/components/layout/BackToHome';
import { timeAgo, getCategoryStyle } from '@/lib/utils';

export const dynamic = 'force-dynamic';

const bushehrCityNames = [
  'بوشهر', 'دیر', 'دیلم', 'گناوه', 'برازجان', 'خورموج', 'اهرم',
  'کنگان', 'عسلویه', 'جم', 'خارگ', 'ریگ', 'آب‌پخش', 'بردخون', 'آبدان',
  'کاکی', 'شنبه', 'بوالخیر', 'تنگ ارم', 'سعدآباد', 'شبانکاره', 'دلوار',
  'سیراف', 'بنک', 'نخل تقی', 'انارستان',
];

const villageRefWords = ['روستا', 'دهستان', 'روستایی', 'روستاییان', 'عشایر', 'بومی'];

export default async function VillagesPage() {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const conditions: any[] = [];

  for (const city of bushehrCityNames) {
    for (const vWord of villageRefWords) {
      conditions.push({
        AND: [
          { title: { contains: city } },
          { title: { contains: vWord } },
        ],
      });
    }
  }

  conditions.push({
    AND: [
      { title: { contains: 'استان بوشهر' } },
      { title: { contains: 'روستا' } },
    ],
  });

  conditions.push({
    AND: [
      { title: { contains: 'استان بوشهر' } },
      { title: { contains: 'دهستان' } },
    ],
  });

  const news = await prisma.externalNews.findMany({
    where: {
      status: 'APPROVED',
      publishedAt: { gte: thirtyDaysAgo },
      OR: conditions,
    },
    orderBy: { publishedAt: 'desc' },
    take: 40,
    select: {
      id: true, title: true, link: true, description: true, image: true,
      sourceName: true, category: true, publishedAt: true, region: true,
    },
  });

  const featured = news[0];
  const rest = news.slice(1);

  return (
    <>
      <Header />
      <main className="min-h-screen">
        <section className="relative bg-gradient-to-l from-[#92400e] to-[#b45309] overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-0 left-1/4 w-64 h-64 bg-white/8 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-2xl" />
          </div>
          <div className="site-container relative z-10 py-6 md:py-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 md:w-14 md:h-14 bg-white/15 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20">
                  <span className="text-2xl md:text-3xl">🏡</span>
                </div>
                <div>
                  <h1 className="text-xl md:text-2xl font-black text-white">
                    روستاهای استان <span className="text-[#C9A96E]">بوشهر</span>
                  </h1>
                  <p className="text-white/50 text-xs mt-0.5">آخرین اخبار روستاهای استان بوشهر</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-2 bg-white/10 text-white text-xs px-3 py-1.5 rounded-full border border-white/10">
                  <span className="w-1.5 h-1.5 bg-amber-300 rounded-full animate-pulse" />
                  {news.length} خبر
                </span>
                <nav className="hidden md:flex items-center gap-1.5 text-xs text-white/40">
                  <Link href="/" className="hover:text-white transition-colors">خانه</Link>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                  <Link href="/category/bushahr" className="hover:text-white transition-colors">بوشهر</Link>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                  <span className="text-[#C9A96E] font-bold">روستاها</span>
                </nav>
              </div>
            </div>
          </div>
        </section>

        <div className="site-container py-8">
          {featured && (
            <a href={featured.link} target="_blank" rel="noopener noreferrer" className="group block mb-8 bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-xl hover:shadow-[#92400e]/5 transition-all duration-500">
              <div className="flex flex-col md:flex-row">
                <div className="relative w-full md:w-[50%] h-52 md:h-64 overflow-hidden bg-gray-100">
                  {featured.image ? (
                    <img src={featured.image} alt={featured.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#92400e] to-[#b45309]" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                  <div className="absolute top-3 right-3 flex items-center gap-2">
                    <span className="bg-[#C9A96E] text-[#1B365D] text-[11px] px-3 py-1 rounded-full font-black shadow-lg">⭐ ویژه</span>
                  </div>
                </div>
                <div className="flex-1 p-5 md:p-6 flex flex-col justify-center">
                  <div className="flex items-center gap-2 mb-2">
                    {featured.category && (
                      <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold text-white ${getCategoryStyle(featured.category).bg}`}>
                        {featured.category}
                      </span>
                    )}
                    <span className="text-[10px] text-gray-400 font-medium">{featured.sourceName}</span>
                  </div>
                  <h2 className="text-lg md:text-xl font-black text-[#1B365D] group-hover:text-[#C9A96E] transition-colors duration-300 leading-[1.8] mb-2">
                    {featured.title}
                  </h2>
                  {featured.description && (
                    <p className="text-gray-400 text-sm leading-relaxed line-clamp-2 mb-3">{featured.description}</p>
                  )}
                  <span className="text-[11px] text-gray-400">{timeAgo(featured.publishedAt ? featured.publishedAt.toISOString() : null)}</span>
                </div>
              </div>
            </a>
          )}

          {rest.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {rest.map((n) => (
                <a key={n.id} href={n.link} target="_blank" rel="noopener noreferrer" className="group flex bg-white rounded-xl overflow-hidden border border-gray-100 hover:border-transparent hover:shadow-lg transition-all duration-300">
                  {n.image && (
                    <div className="w-28 sm:w-32 flex-shrink-0 overflow-hidden bg-gray-100">
                      <img src={n.image} alt={n.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    </div>
                  )}
                  <div className="flex-1 p-3.5 flex flex-col justify-between min-w-0">
                    <div>
                      <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                        {n.category && (
                          <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold text-white ${getCategoryStyle(n.category).bg}`}>
                            {n.category}
                          </span>
                        )}
                        <span className="text-[9px] text-gray-400">{n.sourceName}</span>
                      </div>
                      <h3 className="font-black text-[#1B365D] group-hover:text-[#C9A96E] transition-colors duration-300 text-[13px] leading-[1.8] line-clamp-2">
                        {n.title}
                      </h3>
                    </div>
                    <span className="text-[10px] text-gray-400 mt-1.5">{timeAgo(n.publishedAt ? n.publishedAt.toISOString() : null)}</span>
                  </div>
                </a>
              ))}
            </div>
          )}

          {news.length === 0 && (
            <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
              <span className="text-4xl mb-3 block">🏡</span>
              <h2 className="text-lg font-black text-[#1B365D] mb-2">اخبار روستاهای استان بوشهر</h2>
              <p className="text-gray-400 text-sm">در حال حاضر خبری یافت نشد</p>
            </div>
          )}
        </div>
      </main>
      <BackToHome />
      <Footer />
    </>
  );
}
