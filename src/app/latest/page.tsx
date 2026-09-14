import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { timeAgo, getCategoryStyle } from '@/lib/utils';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'همه اخبار',
  description: 'مشاهده همه اخبار لحظه‌ای پایگاه خبری تحلیلی لیان دید - اخبار سایت و خبرگزاری‌ها',
  openGraph: {
    title: 'همه اخبار | لیان دید',
    description: 'مشاهده همه اخبار لحظه‌ای لیان دید',
    type: 'website',
    url: 'https://liandid.ir/latest',
    siteName: 'لیان دید',
    locale: 'fa_IR',
  },
  alternates: { canonical: 'https://liandid.ir/latest' },
};

const PAGE_SIZE = 20;

type NewsItem = {
  id: string;
  title: string;
  link: string;
  description: string | null;
  image: string | null;
  sourceName: string;
  category: string | null;
  publishedAt: Date | null;
  type: 'article' | 'news';
  isBreaking?: boolean;
};

export default async function LatestPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string; cat?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || '1', 10) || 1);
  const query = (params.q || '').trim();
  const catFilter = params.cat || '';

  const whereArticle: any = { status: 'PUBLISHED' };
  const whereNews: any = { status: 'APPROVED' };

  if (query) {
    whereArticle.OR = [
      { title: { contains: query } },
      { excerpt: { contains: query } },
    ];
    whereNews.OR = [
      { title: { contains: query } },
      { description: { contains: query } },
    ];
  }
  if (catFilter) {
    whereArticle.category = { slug: catFilter };
    whereNews.category = catFilter;
  }

  const [rawArticles, rawNews, categories] = await Promise.all([
    prisma.article.findMany({
      where: whereArticle,
      orderBy: { publishedAt: { sort: 'desc', nulls: 'last' } },
      select: {
        id: true, title: true, slug: true, excerpt: true, featuredImage: true,
        publishedAt: true, isBreaking: true,
        category: { select: { name: true, slug: true } },
      },
    }),
    prisma.externalNews.findMany({
      where: whereNews,
      orderBy: { publishedAt: 'desc' },
      select: {
        id: true, title: true, link: true, description: true, image: true,
        sourceName: true, category: true, publishedAt: true, isBreaking: true,
      },
    }),
    prisma.category.findMany({
      orderBy: { name: 'asc' },
      select: { name: true, slug: true },
    }),
  ]);

  const articles: NewsItem[] = rawArticles.map(a => ({
    id: a.id,
    title: a.title,
    link: `/news/${a.slug}`,
    description: a.excerpt,
    image: a.featuredImage,
    sourceName: 'لیان دید',
    category: a.category?.name || null,
    publishedAt: a.publishedAt,
    type: 'article',
    isBreaking: a.isBreaking,
  }));

  const news: NewsItem[] = rawNews.map(n => ({
    id: n.id,
    title: n.title,
    link: n.link,
    description: n.description,
    image: n.image,
    sourceName: n.sourceName,
    category: n.category,
    publishedAt: n.publishedAt,
    type: 'news',
    isBreaking: n.isBreaking,
  }));

  const allItems = [...articles, ...news].sort((a, b) => {
    const ta = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
    const tb = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
    return tb - ta;
  });

  const total = allItems.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const paged = allItems.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const buildHref = (p: number) => {
    const sp = new URLSearchParams();
    if (query) sp.set('q', query);
    if (catFilter) sp.set('cat', catFilter);
    if (p > 1) sp.set('page', String(p));
    const qs = sp.toString();
    return `/latest${qs ? `?${qs}` : ''}`;
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 pt-6 pb-16">

          {/* ─── Header ─── */}
          <div className="flex items-end justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1B365D] to-[#0f1d35] flex items-center justify-center shadow-lg">
                <svg className="w-7 h-7 text-[#C9A96E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-[#0f1d35] tracking-tight">همه اخبار</h1>
                <p className="text-sm text-gray-400 mt-0.5">اخبار لحظه‌ای سایت و خبرگزاری‌ها ({total} خبر)</p>
              </div>
            </div>
            <Link href="/" className="hidden sm:flex items-center gap-2 text-xs text-gray-400 hover:text-[#0f1d35] transition-colors font-bold bg-white hover:bg-gray-100 px-4 py-2.5 rounded-xl border border-gray-200/80">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
              صفحه اصلی
            </Link>
          </div>

          {/* ─── Filters ─── */}
          <form method="get" action="/latest" className="bg-white rounded-2xl border border-gray-200/80 p-4 sm:p-5 mb-6 flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <input type="text" name="q" defaultValue={query} placeholder="جستجو در عنوان خبر..." className="w-full pl-4 pr-11 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#C9A96E] focus:ring-2 focus:ring-[#C9A96E]/10" />
              <svg className="w-5 h-5 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
            <select name="cat" defaultValue={catFilter} className="sm:w-56 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#C9A96E] text-gray-700">
              <option value="">همه دسته‌بندی‌ها</option>
              {categories.map(c => (
                <option key={c.slug} value={c.slug}>{c.name}</option>
              ))}
            </select>
            <button type="submit" className="px-8 py-3 bg-[#1B365D] text-white rounded-xl text-sm font-bold hover:bg-[#0f1d35] transition-colors">جستجو</button>
            {(query || catFilter) && (
              <Link href="/latest" className="px-6 py-3 bg-gray-100 text-gray-600 rounded-xl text-sm font-bold hover:bg-gray-200 transition-colors text-center">حذف فیلتر</Link>
            )}
          </form>

          {/* ─── News List ─── */}
          {paged.length === 0 ? (
            <div className="text-center py-24 bg-white rounded-3xl border border-gray-200/80">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-5">
                <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>
              </div>
              <h2 className="text-xl font-black text-[#0f1d35] mb-2">خبری یافت نشد</h2>
              <p className="text-gray-400 text-sm">با فیلتر دیگری دوباره تلاش کنید</p>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {paged.map(item => (
                  <a
                    key={item.id}
                    href={item.link}
                    target={item.type === 'news' ? '_blank' : undefined}
                    rel={item.type === 'news' ? 'noopener noreferrer' : undefined}
                    className="group flex items-stretch bg-white rounded-xl border border-gray-100 hover:border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-black/5"
                  >
                    {/* Thumbnail */}
                    <div className="relative w-28 sm:w-40 md:w-48 flex-shrink-0 overflow-hidden bg-gray-100">
                      {item.image ? (
                        <img src={item.image} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
                      ) : (
                        <div className={`w-full h-full bg-gradient-to-br ${getCategoryStyle(item.category).gradient}`} />
                      )}
                      <div className="absolute top-3 right-3">
                        <span className={`text-[10px] px-2.5 py-1 rounded-md font-bold text-white ${getCategoryStyle(item.category).bg} shadow-md`}>
                          {item.category || 'عمومی'}
                        </span>
                      </div>
                      {item.isBreaking && (
                        <div className="absolute top-3 left-3">
                          <span className="text-[10px] px-2 py-0.5 rounded-md font-black text-white bg-red-500 shadow-md">فوری</span>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-4 sm:p-5 flex flex-col justify-center min-w-0">
                      <h3 className="font-extrabold text-[#0a1628] group-hover:text-[#C9A96E] transition-colors duration-300 text-[15px] sm:text-base leading-[1.9] line-clamp-2 mb-2">
                        {item.title}
                      </h3>
                      {item.description && (
                        <p className="text-gray-400 text-xs sm:text-sm line-clamp-1 mb-3 leading-relaxed">
                          {item.description}
                        </p>
                      )}
                      <div className="flex items-center gap-3 text-[11px] text-gray-400">
                        <span className="flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          {timeAgo(item.publishedAt ? item.publishedAt.toISOString() : null)}
                        </span>
                        {item.sourceName && item.sourceName !== 'لیان دید' && (
                          <>
                            <span className="w-1 h-1 bg-gray-300 rounded-full" />
                            <span className="font-medium text-gray-500">{item.sourceName}</span>
                          </>
                        )}
                        {item.type === 'article' && (
                          <>
                            <span className="w-1 h-1 bg-gray-300 rounded-full" />
                            <span className="text-[#C9A96E] font-bold">لیان دید</span>
                          </>
                        )}
                      </div>
                    </div>
                  </a>
                ))}
              </div>

              {/* ─── Pagination ─── */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10 flex-wrap">
                  {page > 1 && (
                    <Link href={buildHref(page - 1)} className="px-4 py-2.5 rounded-xl text-[13px] font-bold bg-white text-gray-600 border border-gray-200 hover:border-[#1B365D] hover:text-[#1B365D] transition-all">قبلی</Link>
                  )}
                  {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                    let p: number;
                    if (totalPages <= 7) p = i + 1;
                    else if (page <= 4) p = i + 1;
                    else if (page >= totalPages - 3) p = totalPages - 6 + i;
                    else p = page - 3 + i;
                    return (
                      <Link
                        key={p}
                        href={buildHref(p)}
                        className={`w-10 h-10 flex items-center justify-center rounded-xl text-[13px] font-black transition-all ${
                          p === page
                            ? 'bg-[#1B365D] text-white shadow-lg'
                            : 'bg-white text-gray-600 border border-gray-200 hover:border-[#1B365D] hover:text-[#1B365D]'
                        }`}
                      >
                        {p.toLocaleString('fa-IR')}
                      </Link>
                    );
                  })}
                  {page < totalPages && (
                    <Link href={buildHref(page + 1)} className="px-4 py-2.5 rounded-xl text-[13px] font-bold bg-white text-gray-600 border border-gray-200 hover:border-[#1B365D] hover:text-[#1B365D] transition-all">بعدی</Link>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
