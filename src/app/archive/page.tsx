import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { timeAgo } from '@/lib/utils';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'آرشیو اخبار',
  description: 'آرشیو کامل اخبار پایگاه خبری تحلیلی لیان دید - جستجو و مرور اخبار منتشر شده استان بوشهر و ایران',
  openGraph: {
    title: 'آرشیو اخبار | لیان دید',
    description: 'آرشیو کامل اخبار پایگاه خبری تحلیلی لیان دید',
    type: 'website',
    url: 'https://liandid.ir/archive',
    siteName: 'لیان دید',
    locale: 'fa_IR',
  },
  alternates: { canonical: 'https://liandid.ir/archive' },
};

const PAGE_SIZE = 12;

export default async function ArchivePage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; cat?: string; q?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || '1', 10) || 1);
  const catSlug = params.cat || '';
  const query = (params.q || '').trim();

  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
    select: { id: true, name: true, slug: true },
  });

  const where: any = { status: 'PUBLISHED' };
  if (catSlug) where.category = { slug: catSlug };
  if (query) {
    where.OR = [
      { title: { contains: query } },
      { content: { contains: query } },
      { excerpt: { contains: query } },
    ];
  }

  const [total, articles] = await Promise.all([
    prisma.article.count({ where }),
    prisma.article.findMany({
      where,
      orderBy: { publishedAt: 'desc' },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true, title: true, slug: true, excerpt: true, featuredImage: true,
        publishedAt: true, isBreaking: true, isFeatured: true,
        author: { select: { name: true } },
        category: { select: { name: true, slug: true } },
      },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const buildHref = (p: number) => {
    const sp = new URLSearchParams();
    if (catSlug) sp.set('cat', catSlug);
    if (query) sp.set('q', query);
    if (p > 1) sp.set('page', String(p));
    const qs = sp.toString();
    return `/archive${qs ? `?${qs}` : ''}`;
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 pt-6 pb-16">
          {/* ─── Section Header ─── */}
          <div className="flex items-end justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1B365D] to-[#0f1d35] flex items-center justify-center shadow-lg">
                <svg className="w-7 h-7 text-[#C9A96E]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 100-4h14a2 2 0 110 4M5 8v12a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-[#0f1d35] tracking-tight">آرشیو اخبار</h1>
                <p className="text-sm text-gray-400 mt-0.5">مرور و جستجوی همه اخبار منتشر شده ({total} خبر)</p>
              </div>
            </div>
            <Link href="/" className="hidden sm:flex items-center gap-2 text-xs text-gray-400 hover:text-[#0f1d35] transition-colors font-bold bg-white hover:bg-gray-100 px-4 py-2.5 rounded-xl border border-gray-200/80">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
              صفحه اصلی
            </Link>
          </div>

          {/* ─── Filters ─── */}
          <form method="get" action="/archive" className="bg-white rounded-2xl border border-gray-200/80 p-4 sm:p-5 mb-8 flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                name="q"
                defaultValue={query}
                placeholder="جستجو در عنوان و متن خبر..."
                className="w-full pl-4 pr-11 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#C9A96E] focus:ring-2 focus:ring-[#C9A96E]/10"
              />
              <svg className="w-5 h-5 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
            <select
              name="cat"
              defaultValue={catSlug}
              className="sm:w-56 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#C9A96E] text-gray-700"
            >
              <option value="">همه دسته‌بندی‌ها</option>
              {categories.map(c => (
                <option key={c.id} value={c.slug}>{c.name}</option>
              ))}
            </select>
            <button type="submit" className="px-8 py-3 bg-[#1B365D] text-white rounded-xl text-sm font-bold hover:bg-[#0f1d35] transition-colors">
              جستجو
            </button>
            {(query || catSlug) && (
              <Link href="/archive" className="px-6 py-3 bg-gray-100 text-gray-600 rounded-xl text-sm font-bold hover:bg-gray-200 transition-colors text-center">
                حذف فیلتر
              </Link>
            )}
          </form>

          {articles.length === 0 ? (
            <div className="text-center py-24 bg-white rounded-3xl border border-gray-200/80">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-5">
                <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>
              </div>
              <h2 className="text-xl font-black text-[#0f1d35] mb-2">خبری یافت نشد</h2>
              <p className="text-gray-400 text-sm">با فیلتر دیگری دوباره تلاش کنید</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {articles.map(a => (
                  <Link key={a.id} href={`/news/${a.slug}`} className="group bg-white rounded-2xl overflow-hidden border border-gray-200/80 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                    <div className="relative h-48 bg-[#0f1d35] overflow-hidden">
                      {a.featuredImage ? (
                        <img src={a.featuredImage} alt={a.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#1B365D] to-[#0f1d35] flex items-center justify-center">
                          <span className="text-4xl opacity-30">📰</span>
                        </div>
                      )}
                      <div className="absolute top-3 right-3 flex gap-1.5">
                        {a.isBreaking && <span className="bg-red-500 text-white text-[10px] px-2.5 py-1 rounded-lg font-black">فوری</span>}
                        {a.isFeatured && <span className="bg-[#C9A96E] text-[#0f1d35] text-[10px] px-2.5 py-1 rounded-lg font-black">ویژه</span>}
                      </div>
                    </div>
                    <div className="p-5">
                      {a.category?.name && (
                        <span className="text-[11px] font-bold text-[#C9A96E] mb-2 inline-block">{a.category.name}</span>
                      )}
                      <h2 className="font-black text-[15px] leading-[1.9] text-[#0f1d35] group-hover:text-[#1B365D] transition-colors line-clamp-2 mb-2 text-justify">
                        {a.title}
                      </h2>
                      {a.excerpt && (
                        <p className="text-gray-500 text-[13px] line-clamp-2 leading-relaxed mb-3 text-justify">{a.excerpt}</p>
                      )}
                      <div className="flex items-center gap-2 text-gray-400 text-[11px] pt-3 border-t border-gray-100">
                        <span className="font-medium">{a.author?.name || 'لیان دید'}</span>
                        <span className="w-0.5 h-0.5 bg-gray-300 rounded-full" />
                        <span>{timeAgo(a.publishedAt ? a.publishedAt.toISOString() : null)}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* ─── Pagination ─── */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10 flex-wrap">
                  {page > 1 && (
                    <Link href={buildHref(page - 1)} className="px-4 py-2.5 rounded-xl text-[13px] font-bold bg-white text-gray-600 border border-gray-200 hover:border-[#1B365D] hover:text-[#1B365D] transition-all">
                      قبلی
                    </Link>
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
                    <Link href={buildHref(page + 1)} className="px-4 py-2.5 rounded-xl text-[13px] font-bold bg-white text-gray-600 border border-gray-200 hover:border-[#1B365D] hover:text-[#1B365D] transition-all">
                      بعدی
                    </Link>
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
