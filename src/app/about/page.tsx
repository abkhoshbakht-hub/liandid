import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Image from 'next/image';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'درباره ما',
  description: 'پایگاه خبری تحلیلی لیان دید - درباره ما | پروانه انتشار ۹۶۲۲',
  openGraph: { title: 'درباره ما | لیان دید', description: 'پایگاه خبری تحلیلی لیان دید - درباره ما', type: 'website', url: 'https://liandid.ir/about', siteName: 'لیان دید', locale: 'fa_IR' },
  twitter: { card: 'summary_large_image', title: 'درباره ما | لیان دید', description: 'پایگاه خبری تحلیلی لیان دید' },
  alternates: { canonical: 'https://liandid.ir/about' },
};

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="bg-gray-50 min-h-screen">
        {/* هیرو */}
        <section className="relative bg-gradient-to-br from-[#1B365D] via-[#2a4a7a] to-[#1B365D] text-white overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 right-10 w-72 h-72 bg-[#C9A96E] rounded-full blur-[120px]" />
            <div className="absolute bottom-10 left-10 w-96 h-96 bg-[#C9A96E] rounded-full blur-[150px]" />
          </div>
          <div className="site-container py-12 relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-3xl md:text-4xl font-black mb-4">
                درباره <span className="text-[#C9A96E]">لیان دید</span>
              </h1>
              <p className="text-base text-white/70">
                پایگاه خبری تحلیلی مستقل در جنوب ایران
              </p>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-50 to-transparent" />
        </section>

        <div className="site-container py-12">
          {/* آمار */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16 -mt-8 relative z-20">
            {[
              { num: '۸', label: 'سال فعالیت' },
              { num: '۹۶۲۲', label: 'پروانه انتشار' },
              { num: '۵۰+', label: 'خبرنگار' },
              { num: '۲۴/۷', label: 'پوشش خبری' },
            ].map((stat, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 text-center">
                <div className="text-3xl font-black text-[#1B365D]">{stat.num}</div>
                <div className="text-xs text-gray-400 font-bold mt-2">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* معرفی */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-8 bg-[#C9A96E] rounded-full" />
                <h2 className="text-2xl font-black text-[#1B365D]">داستان ما</h2>
              </div>
              <div className="space-y-4 text-gray-600 leading-8 text-justify">
                <p>
                  <strong className="text-[#1B365D]">لیان دید</strong> در سال ۱۳۹۶ با یک هدف ساده اما بزرگ متولد شد: اطلاع‌رسانی دقیق، سریع و بی‌طرفانه به مردم جنوب ایران.
                </p>
                <p>
                  ما باور داریم هر شهروندی حق دارد به اخبار معتبر و تحلیل‌های عمیق دسترسی داشته باشد. از همان روز اول، استقلال فکری و مالی را سرلوحه کار خود قرار دادیم.
                </p>
                <p>
                  امروز لیان دید به یکی از معتبرترین رسانه‌های جنوب ایران تبدیل شده و هزاران مخاطب روزانه اخبار ما را دنبال می‌کنند.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-[#1B365D] to-[#2a4a7a] rounded-3xl overflow-hidden flex flex-col md:flex-row">
                  <div className="p-8 md:p-10 text-white relative z-10 flex-1">
                    <div className="text-[#C9A96E] text-5xl font-black mb-4">"</div>
                    <p className="text-base md:text-lg leading-8 mb-8 text-justify">
                      ما متعهد به ارائه اخبار حقیقی و تحلیل‌های منصفانه هستیم. آزادی بیان و حق دسترسی شهروندان به اطلاعات، خط قرمز ماست.
                    </p>
                    <div>
                      <div className="font-bold text-lg">محمدمهدی علی پور</div>
                      <div className="text-white/60 text-sm">مدیرمسئول — پایگاه خبری لیان دید</div>
                    </div>
                  </div>
                  <div className="w-full md:w-1/3 h-64 md:h-auto relative">
                    <img src="/Alipour.jpg" alt="محمدمهدی علی پور" className="absolute inset-0 w-full h-full object-cover" />
                  </div>
                </div>
            </div>
          </div>

          {/* ارزش‌ها */}
          <div className="mb-20">
            <div className="bg-gradient-to-br from-[#1B365D] to-[#0f2440] rounded-3xl overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-5">
                <div className="lg:col-span-2 bg-[#C9A96E]/10 p-10 flex flex-col justify-center items-center text-center relative">
                  <div className="absolute top-0 left-0 w-32 h-32 bg-[#C9A96E]/20 rounded-full blur-3xl" />
                  <div className="relative z-10">
                    <span className="text-[#C9A96E] text-7xl font-black leading-none block mb-2">"</span>
                    <p className="text-white text-lg font-black leading-8">
                      حقیقت، ستون اصلی این رسانه است
                    </p>
                  </div>
                </div>
                <div className="lg:col-span-3 p-8 lg:p-10">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    {[
                      { title: 'دقت', desc: 'بررسی و مستندسازی کامل هر خبر', num: '۱' },
                      { title: 'سرعت', desc: 'انتشار لحظه‌ای بدون افت کیفیت', num: '۲' },
                      { title: 'بی‌طرفی', desc: 'بازتاب واقعیت‌ها بدون جانبداری', num: '۳' },
                      { title: 'استقلال', desc: 'استقلال از تمام جریان‌ها', num: '۴' },
                      { title: 'اخلاق', desc: 'اصول حرفه‌ای روزنامه‌نگاری', num: '۵' },
                      { title: 'جامعه', desc: 'اطلاع‌رسانی شفاف به شهروندان', num: '۶' },
                    ].map((item, i) => (
                      <div key={i} className="group text-center">
                        <span className="text-[#C9A96E]/30 text-3xl font-black block mb-1 group-hover:text-[#C9A96E]/60 transition-colors">{item.num}</span>
                        <h3 className="text-white font-black text-sm mb-1">{item.title}</h3>
                        <p className="text-white/40 text-xs leading-6">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* تیم */}
          <div className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-2xl font-black text-[#1B365D] mb-3">تیم ما</h2>
              <p className="text-gray-500">روزنامه‌نگاران و کارشناسان باتجربه</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { name: 'روزنامه‌نگار', count: '۱۲ نفر', icon: '📰' },
                { name: 'تحلیلگر', count: '۸ نفر', icon: '📊' },
                { name: 'عکاس', count: '۴ نفر', icon: '📷' },
                { name: 'تیم فنی', count: '۶ نفر', icon: '💻' },
              ].map((item, i) => (
                <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 text-center hover:border-[#C9A96E] transition-colors">
                  <div className="text-4xl mb-3">{item.icon}</div>
                  <div className="font-bold text-[#1B365D] mb-1">{item.name}</div>
                  <div className="text-sm text-[#C9A96E] font-bold">{item.count}</div>
                </div>
              ))}
            </div>
          </div>

          {/* تماس */}
          <div className="bg-gradient-to-br from-[#1B365D] to-[#2a4a7a] rounded-3xl p-10 text-white text-center">
            <h2 className="text-2xl font-black mb-3">با ما در تماس باشید</h2>
            <p className="text-white/70 mb-6">سوالی دارید؟ پیشنهادی دارید؟ خوشحال می‌شویم بشنویم</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6 text-sm text-white/60">
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4 text-[#C9A96E]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                بوشهر، امامزاده مهر ۱۸
              </span>
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4 text-[#C9A96E]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                <span dir="ltr">۰۹۳۶-۰۲۸-۰۵۶۲</span>
              </span>
            </div>
            <a href="/contact" className="inline-flex items-center gap-2 bg-[#C9A96E] text-[#1B365D] px-8 py-3 rounded-xl font-bold hover:bg-[#d4b87a] transition-colors">
              تماس با ما
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
