import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import BackToHome from '@/components/layout/BackToHome';
import { timeAgo, getCategoryStyle } from '@/lib/utils';
import { categoryMap, subcategoryMap } from '@/lib/topics';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ slug: string; subslug: string }> }): Promise<Metadata> {
  const { slug, subslug } = await params;
  const cat = categoryMap[slug];
  const sub = subcategoryMap[subslug];
  if (!cat || !sub) return { title: 'صفحه یافت نشد', robots: { index: false } };
  const subName = sub.def?.name || subslug;
  const title = `${subName} - ${cat.name}`;
  const description = `آخرین اخبار ${subName} در بخش ${cat.name} - پایگاه خبری لیان دید`;
  return {
    title, description,
    openGraph: { title, description, type: 'website', url: `https://liandid.ir/category/${slug}/${subslug}`, siteName: 'لیان دید', locale: 'fa_IR' },
    twitter: { card: 'summary_large_image', title, description },
    alternates: { canonical: `https://liandid.ir/category/${slug}/${subslug}` },
  };
}

export default async function SubcategoryPage({
  params,
}: {
  params: Promise<{ slug: string; subslug: string }>;
}) {
  const { slug, subslug } = await params;
  const category = categoryMap[slug];
  const subInfo = subcategoryMap[subslug];

  if (!category || !subInfo) {
    return (
      <>
        <Header />
        <main className="min-h-screen flex items-center justify-center">
          <div className="text-center py-20">
            <h1 className="text-xl font-bold text-gray-700">صفحه یافت نشد</h1>
            <Link href="/" className="inline-block mt-4 bg-[#0f1d35] text-white px-5 py-2.5 rounded-xl text-sm font-bold">بازگشت</Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const subDef = subInfo.def;
  const icon = category.icon || '📰';
  const colorStyle = getCategoryStyle(category.name);

  const [externalNews, articles] = await Promise.all([
    prisma.externalNews.findMany({
      where: { status: 'APPROVED', topic: subslug },
      orderBy: { publishedAt: 'desc' },
      take: 50,
      select: {
        id: true, title: true, link: true, description: true, image: true,
        sourceName: true, category: true, topic: true, publishedAt: true,
      },
    }),
    prisma.article.findMany({
      where: { status: 'PUBLISHED', category: { slug } },
      orderBy: { publishedAt: 'desc' },
      take: 50,
      select: {
        id: true, title: true, slug: true, featuredImage: true, excerpt: true,
        category: { select: { name: true } }, publishedAt: true,
      },
    }).catch(() => []),
  ]);

  const items = [
    ...articles.map(a => ({
      id: a.id, title: a.title, href: `/news/${a.slug}`,
      image: a.featuredImage, description: a.excerpt,
      sourceName: 'لیان دید', category: a.category?.name ?? null,
      publishedAt: a.publishedAt,
    })),
    ...externalNews.map(n => ({
      id: n.id, title: n.title, href: n.link,
      image: n.image, description: n.description,
      sourceName: n.sourceName, category: n.category,
      publishedAt: n.publishedAt,
    })),
  ].sort((a, b) => (b.publishedAt?.getTime() || 0) - (a.publishedAt?.getTime() || 0));

  const subCategories = category.subcategories;
  const hero = items[0];
  const side = items.slice(1, 3);
  const middle = items.slice(3, 7);
  const latest = items.slice(7);

  return (
    <>
      <Header />
      <main className="min-h-screen">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 pt-6 pb-16">

          {/* ─── Section Header ─── */}
          <div className="flex items-end justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${category.color} flex items-center justify-center shadow-lg`}>
                <span className="text-2xl">{icon}</span>
              </div>
              <div>
                <nav className="flex items-center gap-1.5 text-[11px] text-gray-400 mb-1">
                  <Link href={`/category/${slug}`} className="hover:text-[#0f1d35] transition-colors font-medium">{category.name}</Link>
                  <span>/</span>
                  <span className="text-[#C9A96E] font-bold">{subDef.name}</span>
                </nav>
                <h1 className="text-2xl sm:text-3xl font-black text-[#0f1d35] tracking-tight">{subDef.name}</h1>
              </div>
            </div>
          </div>

          {/* ─── Subcategory Tabs ─── */}
          <div className="flex gap-2 mb-8 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
            {subCategories.map(sub => (
              <Link
                key={sub.slug}
                href={`/category/${slug}/${sub.slug}`}
                className={`group px-5 py-2.5 rounded-xl text-[13px] font-bold whitespace-nowrap transition-all duration-300 ${
                  sub.slug === subslug
                    ? `bg-gradient-to-l ${category.color} text-white shadow-lg shadow-gray-200/50`
                    : 'bg-white text-gray-500 border border-gray-200/80 hover:border-gray-300 hover:text-[#0f1d35] hover:shadow-md'
                }`}
              >
                {sub.name}
              </Link>
            ))}
          </div>

          {items.length === 0 ? (
            <div className="text-center py-24 bg-gray-50 rounded-3xl border border-gray-100">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-5">
                <span className="text-4xl">{icon}</span>
              </div>
              <h2 className="text-xl font-black text-[#0f1d35] mb-2">خبری یافت نشد</h2>
              <p className="text-gray-400 text-sm">اخبار {subDef.name} به زودی اضافه می‌شوند</p>
            </div>
          ) : (
            <>
              {/* ─── Hero + Side ─── */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
                {hero && (
                  <a
                    href={hero.href}
                    target={hero.href.startsWith('http') ? '_blank' : undefined}
                    rel={hero.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className="lg:col-span-2 group relative rounded-3xl overflow-hidden bg-[#0f1d35] min-h-[420px] sm:min-h-[480px]"
                  >
                    {hero.image ? (
                      <img src={hero.image} alt={hero.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.2s] group-hover:scale-[1.03] opacity-80 group-hover:opacity-100" />
                    ) : (
                      <div className={`absolute inset-0 bg-gradient-to-br ${category.color}`} />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0f1d35] via-[#0f1d35]/30 to-transparent" />
                    <div className="absolute bottom-0 right-0 left-0 p-6 sm:p-8">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="bg-[#C9A96E] text-[#0f1d35] text-[10px] px-3 py-1 rounded-lg font-black tracking-wider">ویژه</span>
                        <span className={`text-[10px] px-2.5 py-1 rounded-lg font-bold text-white ${colorStyle.bg}`}>{hero.category || category.name}</span>
                      </div>
                      <h2 className="text-white font-black text-xl sm:text-2xl lg:text-3xl leading-[1.8] group-hover:text-[#C9A96E] transition-colors duration-300 line-clamp-3 mb-3">{hero.title}</h2>
                      {hero.description && (
                        <p className="text-white/50 text-sm line-clamp-2 leading-relaxed mb-3 max-w-xl hidden sm:block">{hero.description}</p>
                      )}
                      <div className="flex items-center gap-3 text-white/40 text-xs">
                        <span className="font-medium">{hero.sourceName}</span>
                        <span className="w-1 h-1 bg-white/20 rounded-full" />
                        <span>{timeAgo(hero.publishedAt ? hero.publishedAt.toISOString() : null)}</span>
                      </div>
                    </div>
                  </a>
                )}

                <div className="flex flex-col gap-4">
                  {side.map(item => (
                    <a
                      key={item.id}
                      href={item.href}
                      target={item.href.startsWith('http') ? '_blank' : undefined}
                      rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                      className="group relative flex-1 rounded-2xl overflow-hidden bg-[#0f1d35] min-h-[200px]"
                    >
                      {item.image ? (
                        <img src={item.image} alt={item.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-70 group-hover:opacity-90" />
                      ) : (
                        <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-60`} />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0f1d35]/90 via-[#0f1d35]/30 to-transparent" />
                      <div className="absolute bottom-0 right-0 left-0 p-4">
                        <h3 className="text-white font-black text-[15px] leading-[1.9] group-hover:text-[#C9A96E] transition-colors line-clamp-2">{item.title}</h3>
                        <div className="flex items-center gap-2 text-white/40 text-[10px] mt-1.5">
                          <span>{item.sourceName}</span>
                          <span className="w-0.5 h-0.5 bg-white/20 rounded-full" />
                          <span>{timeAgo(item.publishedAt ? item.publishedAt.toISOString() : null)}</span>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>

              {/* ─── Divider ─── */}
              <div className="flex items-center gap-4 mb-8">
                <div className="w-1.5 h-6 bg-[#C9A96E] rounded-full" />
                <h2 className="text-base font-black text-[#0f1d35]">{subDef.name}</h2>
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-[11px] text-gray-400 font-medium">{items.length} خبر</span>
              </div>

              {/* ─── Middle Grid ─── */}
              {middle.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  {middle.map(item => (
                    <a
                      key={item.id}
                      href={item.href}
                      target={item.href.startsWith('http') ? '_blank' : undefined}
                      rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                      className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-gray-200 hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-400"
                    >
                      <div className="aspect-[16/10] overflow-hidden bg-gray-100 relative">
                        {item.image ? (
                          <img src={item.image} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                        ) : (
                          <div className={`w-full h-full bg-gradient-to-br ${category.color} opacity-40`} />
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-black text-[#0f1d35] group-hover:text-[#C9A96E] transition-colors text-[13px] leading-[1.9] line-clamp-3 mb-2">{item.title}</h3>
                        <div className="flex items-center justify-between text-[10px] text-gray-400 pt-2 border-t border-gray-100">
                          <span>{item.sourceName}</span>
                          <span>{timeAgo(item.publishedAt ? item.publishedAt.toISOString() : null)}</span>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              )}

              {/* ─── Latest List ─── */}
              {latest.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {latest.map(item => (
                    <a
                      key={item.id}
                      href={item.href}
                      target={item.href.startsWith('http') ? '_blank' : undefined}
                      rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                      className="group flex gap-4 p-4 bg-white rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-lg hover:shadow-gray-100/80 transition-all duration-300"
                    >
                      {item.image && (
                        <div className="w-[100px] h-[80px] rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                          <img src={item.image} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <h3 className="font-black text-[#0f1d35] group-hover:text-[#C9A96E] transition-colors text-[13px] leading-[1.8] line-clamp-2">{item.title}</h3>
                        <div className="flex items-center gap-2 text-[10px] text-gray-400 mt-1">
                          <span>{item.sourceName}</span>
                          <span className="w-0.5 h-0.5 bg-gray-300 rounded-full" />
                          <span>{timeAgo(item.publishedAt ? item.publishedAt.toISOString() : null)}</span>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <BackToHome />
      <Footer />
    </>
  );
}
