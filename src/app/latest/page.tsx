import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { timeAgo, getCategoryStyle } from '@/lib/utils';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'همه اخبار',
  description: 'مشاهده همه اخبار لحظه‌ای پایگاه خبری تحلیلی لیان دید',
  alternates: { canonical: 'https://liandid.ir/latest' },
};

const PAGE_SIZE = 30;

type NewsItem = {
  id: string;
  title: string;
  link: string;
  image: string | null;
  sourceName: string;
  category: string | null;
  publishedAt: Date | null;
  type: 'article' | 'news';
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
    whereArticle.OR = [{ title: { contains: query } }];
    whereNews.OR = [{ title: { contains: query } }];
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
        id: true, title: true, slug: true, featuredImage: true,
        publishedAt: true,
        category: { select: { name: true, slug: true } },
      },
    }),
    prisma.externalNews.findMany({
      where: whereNews,
      orderBy: { publishedAt: 'desc' },
      select: {
        id: true, title: true, link: true, image: true,
        sourceName: true, category: true, publishedAt: true,
      },
    }),
    prisma.category.findMany({
      orderBy: { name: 'asc' },
      select: { name: true, slug: true },
    }),
  ]);

  const articles: NewsItem[] = rawArticles.map(a => ({
    id: a.id, title: a.title, link: `/news/${a.slug}`,
    image: a.featuredImage, sourceName: 'لیان دید',
    category: a.category?.name || null, publishedAt: a.publishedAt, type: 'article',
  }));

  const news: NewsItem[] = rawNews.map(n => ({
    id: n.id, title: n.title, link: n.link,
    image: n.image, sourceName: n.sourceName,
    category: n.category, publishedAt: n.publishedAt, type: 'news',
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
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 pt-4 pb-12">

          {/* ─── Header ─── */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1B365D] to-[#0f1d35] flex items-center justify-center shadow-md">
                <svg className="w-5 h-5 text-[#C9A96E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-black text-[#0f1d35]">همه اخبار</h1>
                <p className="text-xs text-gray-400">{total} خبر</p>
              </div>
            </div>
            <Link href="/" className="text-xs text-gray-400 hover:text-[#1B365D] transition-colors font-bold bg-white hover:bg-gray-100 px-3 py-2 rounded-lg border border-gray-200/80">
              صفحه اصلی
            </Link>
          </div>

          {/* ─── Filters ─── */}
          <form method="get" action="/latest" className="bg-white rounded-xl border border-gray-200/80 p-3 mb-4 flex flex-col sm:flex-row gap-2">
            <div className="flex-1 relative">
              <input type="text" name="q" defaultValue={query} placeholder="جستجو..." className="w-full pl-3 pr-9 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#C9A96E]" />
              <svg className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
            <select name="cat" defaultValue={catFilter} className="sm:w-48 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#C9A96E] text-gray-700">
              <option value="">همه دسته‌ها</option>
              {categories.map(c => (
                <option key={c.slug} value={c.slug}>{c.name}</option>
              ))}
            </select>
            <button type="submit" className="px-5 py-2 bg-[#1B365D] text-white rounded-lg text-sm font-bold hover:bg-[#0f1d35] transition-colors">جستجو</button>
            {(query || catFilter) && (
              <Link href="/latest" className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-bold hover:bg-gray-200 transition-colors text-center">حذف</Link>
            )}
          </form>

          {/* ─── News List ─── */}
          {paged.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-200/80">
              <h2 className="text-lg font-black text-[#0f1d35] mb-1">خبری یافت نشد</h2>
              <p className="text-gray-400 text-sm">با فیلتر دیگری تلاش کنید</p>
            </div>
          ) : (
            <>
              <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-100 overflow-hidden">
                {paged.map(item => (
                  <a
                    key={item.id}
                    href={item.link}
                    target={item.type === 'news' ? '_blank' : undefined}
                    rel={item.type === 'news' ? 'noopener noreferrer' : undefined}
                    className="group flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors"
                  >
                    {/* Thumbnail */}
                    <div className="relative w-16 h-12 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                      {item.image ? (
                        <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                      ) : (
                        <div className={`w-full h-full bg-gradient-to-br ${getCategoryStyle(item.category).gradient}`} />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-[#0a1628] group-hover:text-[#C9A96E] transition-colors text-[13px] leading-[1.8] line-clamp-1">
                        {item.title}
                      </h3>
                      <div className="flex items-center gap-2 text-[11px] text-gray-400 mt-0.5">
                        {item.category && (
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold text-white ${getCategoryStyle(item.category).bg}`}>
                            {item.category}
                          </span>
                        )}
                        <span>{timeAgo(item.publishedAt ? item.publishedAt.toISOString() : null)}</span>
                        {item.sourceName && item.sourceName !== 'لیان دید' && (
                          <>
                            <span className="w-0.5 h-0.5 bg-gray-300 rounded-full" />
                            <span className="text-gray-500">{item.sourceName}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </a>
                ))}
              </div>

              {/* ─── Pagination ─── */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-1.5 mt-8 flex-wrap">
                  {page > 1 && (
                    <Link href={buildHref(page - 1)} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white text-gray-600 border border-gray-200 hover:border-[#1B365D] hover:text-[#1B365D] transition-all">قبلی</Link>
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
                        className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-black transition-all ${
                          p === page ? 'bg-[#1B365D] text-white shadow' : 'bg-white text-gray-600 border border-gray-200 hover:border-[#1B365D] hover:text-[#1B365D]'
                        }`}
                      >
                        {p.toLocaleString('fa-IR')}
                      </Link>
                    );
                  })}
                  {page < totalPages && (
                    <Link href={buildHref(page + 1)} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white text-gray-600 border border-gray-200 hover:border-[#1B365D] hover:text-[#1B365D] transition-all">بعدی</Link>
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
