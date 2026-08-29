import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import BackToHome from '@/components/layout/BackToHome';
import { timeAgo, getCategoryStyle } from '@/lib/utils';

export const dynamic = 'force-dynamic';

const shahrestanNames: Record<string, string> = {
  booshehr: 'بوشهر', dayer: 'دیر', deylam: 'دیلم', genaveh: 'گناوه',
  dashtestan: 'دشتستان', dashti: 'دشتی', tangestan: 'تنگستان',
  kangan: 'کنگان', asaluyeh: 'عسلویه', jam: 'جم', kharg: 'جزیره خارگ',
};

// شهرها و روستاهای هر شهرستان برای فیلتر اخبار
const regionKeywords: Record<string, { city: string[]; village: string[] }> = {
  booshehr: {
    city: ['بوشهر', 'بندر بوشهر', 'خارگ'],
    village: ['عالی‌شهر', 'عیش‌آباد', 'جزیره خارگ'],
  },
  dayer: {
    city: ['دیر', 'بردخون', 'آبدان'],
    village: ['لاور', 'وحدتیه', 'دوراهک'],
  },
  deylam: {
    city: ['دیلم', 'بندر امام حسن'],
    village: ['وحدتیه', 'روستای امام حسن'],
  },
  genaveh: {
    city: ['گناوه', 'بندر گناوه', 'ریگ'],
    village: ['بندر ریگ', 'روستای ساحلی'],
  },
  dashtestan: {
    city: ['برازجان', 'آب‌پخش', 'بوشکان', 'تنگ ارم', 'سعدآباد', 'شبانکاره', 'دلوار', 'وحدتیه', 'کلمه'],
    village: ['روستای', 'دهستان'],
  },
  dashti: {
    city: ['خورموج', 'کاکی', 'شنبه', 'بوالخیر', 'طسوج'],
    village: ['روستای', 'دهستان'],
  },
  tangestan: {
    city: ['اهرم', 'دلوار', 'آباد'],
    village: ['روستای', 'دهستان'],
  },
  kangan: {
    city: ['کنگان', 'بندر کنگان', 'سیراف', 'بنک'],
    village: ['روستای', 'دهستان'],
  },
  asaluyeh: {
    city: ['عسلویه', 'نخل تقی', 'بندر عسلویه'],
    village: ['روستای', 'دهستان', 'نخل تقی'],
  },
  jam: {
    city: ['جم', 'شهر جم', 'انارستان', 'ریز'],
    village: ['روستای', 'دهستان'],
  },
  kharg: {
    city: ['خارگ', 'جزیره خارگ'],
    village: [],
  },
};

const shahrestanNamesNoSpace = ['دیر', 'جم'];

function escapeRegex(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export default async function CityVillagePage({
  params,
}: {
  params: Promise<{ slug: string; subslug: string }>;
}) {
  const { slug, subslug } = await params;
  const name = shahrestanNames[slug] || slug;
  const isCity = subslug === 'city';
  const sectionName = isCity ? 'شهر' : 'روستا';
  const keywords = regionKeywords[slug]?.[isCity ? 'city' : 'village'] || [];
  const regionKey = `${slug}:${isCity ? 'city' : 'village'}`;

  let news: {
    id: string; title: string; link: string; description: string | null;
    image: string | null; sourceName: string; category: string | null; publishedAt: Date | null;
  }[] = [];
  if (keywords.length > 0) {
    const orConditions = keywords.map(k => ({
      title: { contains: k },
    }));
    news = await prisma.externalNews.findMany({
      where: {
        status: 'APPROVED',
        OR: orConditions,
      },
      orderBy: { publishedAt: 'desc' },
      take: 30,
      select: {
        id: true, title: true, link: true, description: true, image: true,
        sourceName: true, category: true, publishedAt: true,
      },
    });
  }

  // اخبار اختصاص‌یافته توسط مدیر به این بخش (فیلد region)
  const assigned = await prisma.externalNews.findMany({
    where: {
      status: 'APPROVED',
      region: regionKey,
    },
    orderBy: { publishedAt: 'desc' },
    take: 30,
    select: {
      id: true, title: true, link: true, description: true, image: true,
      sourceName: true, category: true, publishedAt: true,
    },
  });

  const seen = new Set(news.map(n => n.id));
  for (const a of assigned) {
    if (!seen.has(a.id)) news.push(a);
  }
  const isBigCity = keywords.length >= 2;

  return (
    <>
      <Header />
      <main className="bg-gray-50 min-h-screen">
        <div className="site-container py-10">
          {/* بردکرامب */}
          <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
            <Link href="/" className="hover:text-[#1B365D]">صفحه اصلی</Link>
            <span>/</span>
            <Link href="/category/bushahr" className="hover:text-[#1B365D]">بوشهر</Link>
            <span>/</span>
            <Link href={`/category/bushahr/${slug}`} className="hover:text-[#1B365D]">{name}</Link>
            <span>/</span>
            <span className="text-[#1B365D] font-bold">{sectionName}</span>
          </nav>

          {/* هدر بخش */}
          <div className="bg-gradient-to-l from-[#1B365D] to-[#2E5090] rounded-2xl p-8 mb-8 text-white relative overflow-hidden">
            <div className="absolute top-0 left-0 w-32 h-32 bg-[#C9A96E]/10 rounded-full -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-48 h-48 bg-white/5 rounded-full translate-x-1/3 translate-y-1/3" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-4xl">{isCity ? '🏙️' : '🏡'}</span>
                <h1 className="text-3xl font-black">اخبار {sectionName} {name}</h1>
              </div>
              <p className="text-white/80 text-sm">آخرین اخبار {sectionName}های شهرستان {name}</p>
            </div>
          </div>

          {/* دکمه‌های بخش شهر / روستا */}
          <div className="flex gap-3 mb-8">
            <Link
              href={`/category/bushahr/${slug}/city`}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${isCity ? 'bg-[#1B365D] text-white shadow-lg' : 'bg-white text-gray-600 border border-gray-200 hover:border-[#1B365D]'}`}
            >
              🏙️ شهر
            </Link>
            <Link
              href={`/category/bushahr/${slug}/village`}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${!isCity ? 'bg-[#C9A96E] text-white shadow-lg' : 'bg-white text-gray-600 border border-gray-200 hover:border-[#C9A96E]'}`}
            >
              🏡 روستا
            </Link>
          </div>

          {/* لیست اخبار */}
          {news.length > 0 ? (
            <div className="space-y-4">
              {news.map((n) => (
                <a
                  key={n.id}
                  href={n.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-lg hover:border-[#C9A96E]/30 transition-all duration-300"
                >
                  <div className="flex items-start gap-4">
                    {n.image && (
                      <div className="w-28 h-20 rounded-xl overflow-hidden flex-shrink-0 hidden sm:block">
                        <img src={n.image} alt={n.title} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        {n.category && (
                          <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold text-white ${getCategoryStyle(n.category).bg}`}>
                            {n.category}
                          </span>
                        )}
                        {n.sourceName && (
                          <span className="text-[10px] text-gray-400 font-medium">{n.sourceName}</span>
                        )}
                      </div>
                      <h3 className="font-black text-[#1B365D] hover:text-[#C9A96E] transition-colors text-base leading-[1.9] line-clamp-2">
                        {n.title}
                      </h3>
                      {n.description && (
                        <p className="text-gray-400 text-sm line-clamp-1 mt-1">{n.description}</p>
                      )}
                      <div className="flex items-center gap-2 mt-2 text-[11px] text-gray-400">
                        <span>{timeAgo(n.publishedAt ? n.publishedAt.toISOString() : null)}</span>
                      </div>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-8 text-center border border-gray-100">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-gray-700 mb-2">اخبار {sectionName} {name}</h2>
              <p className="text-gray-400 text-sm">خبری برای این بخش یافت نشد</p>
              <Link
                href={`/category/bushahr/${slug}`}
                className="inline-block mt-5 px-6 py-2.5 bg-[#1B365D] text-white rounded-xl text-sm font-bold hover:bg-[#2a4a7a] transition-colors"
              >
                بازگشت به اخبار {name}
              </Link>
            </div>
          )}
        </div>
      </main>
      <BackToHome />
      <Footer />
    </>
  );
}
