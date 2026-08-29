import { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { prisma } from '@/lib/prisma';

async function getLaunchPage() {
  try {
    const page = await prisma.staticPage.findUnique({ where: { slug: 'launch' } });
    return page;
  } catch {
    return null;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const page = await getLaunchPage();
  return {
    title: page?.title || 'آغاز به کار لیان دید',
    description: page?.excerpt || 'بیانیه مدیر مسئول لیان دید به مناسبت آغاز به کار',
    openGraph: {
      title: page?.title || 'آغاز به کار لیان دید',
      description: page?.excerpt || '',
      type: 'article',
      url: 'https://liandid.ir/about/launch',
      siteName: 'لیان دید',
      locale: 'fa_IR',
      images: page?.authorImage ? [{ url: page.authorImage, width: 800, height: 600, alt: page.authorName || '' }] : [],
    },
    twitter: { card: 'summary_large_image', title: page?.title || '', images: page?.authorImage ? [page.authorImage] : [] },
    alternates: { canonical: 'https://liandid.ir/about/launch' },
  };
}

export default async function LaunchPage() {
  const page = await getLaunchPage();

  return (
    <>
      <Header />
      <main className="bg-gray-50 min-h-screen">
        <section className="relative bg-gradient-to-br from-[#1B365D] via-[#2a4a7a] to-[#1B365D] text-white overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 right-10 w-72 h-72 bg-[#C9A96E] rounded-full blur-[120px]" />
            <div className="absolute bottom-10 left-10 w-96 h-96 bg-[#C9A96E] rounded-full blur-[150px]" />
          </div>
          <div className="site-container py-20 relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 bg-[#C9A96E]/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-bold mb-6 border border-[#C9A96E]/30">
                پیام مدیر مسئول
              </div>
              <h1 className="text-3xl md:text-4xl font-black mb-4 leading-relaxed">
                {page?.title || 'آغاز به کار لیان دید'}
              </h1>
              {page?.excerpt && <p className="text-lg text-white/70">{page.excerpt}</p>}
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-50 to-transparent" />
        </section>

        <div className="site-container py-12">
          <article className="max-w-3xl mx-auto">
            {page?.authorName && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-8 flex items-center gap-5">
                {page.authorImage && (
                  <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-[#C9A96E]/30 flex-shrink-0">
                    <img src={page.authorImage} alt={page.authorName} className="w-full h-full object-cover" style={{imageRendering: 'auto'}} />
                  </div>
                )}
                <div>
                  <h2 className="text-lg font-black text-[#1B365D]">{page.authorName}</h2>
                  <p className="text-sm text-gray-500">مدیر مسئول پایگاه خبری تحلیلی لیان دید</p>
                </div>
              </div>
            )}

            <div className="bg-white rounded-2xl border border-gray-100 p-8 md:p-12">
              {page?.content ? (
                <div className="prose prose-lg max-w-none text-gray-700 leading-[2.2] text-justify" dangerouslySetInnerHTML={{ __html: page.content }} />
              ) : (
                <div className="text-center py-20 text-gray-400">
                  <p>محتوا هنوز وارد نشده است.</p>
                  <p className="text-sm mt-2">از داشبورد مدیریت &gt; صفحات ایستا &gt; ویرایش صفحات، محتوا را وارد کنید.</p>
                </div>
              )}
            </div>

            <div className="mt-8 text-center">
              <a href="/" className="inline-flex items-center gap-2 text-sm text-[#1B365D] hover:text-[#C9A96E] font-bold transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                بازگشت به صفحه اصلی
              </a>
            </div>
          </article>
        </div>
      </main>
      <Footer />
    </>
  );
}
