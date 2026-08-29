'use client';

import { useState, useEffect } from 'react';

interface SlotNews {
  id: string;
  title: string;
  link: string;
  description: string;
  image: string;
  source: string;
  sourceName: string;
  category: string | null;
  publishedAt: string | null;
  isCustom: boolean;
}

interface MarketItem {
  label: string;
  value: string;
  unit: string;
  change: string;
  changePercent: string;
  trend: 'up' | 'down';
}

const calendarEvents = [
  '۱۶ مرداد — سالروز شهادت امام جواد (ع)',
  '۱۸ مرداد — روز م矮نی و ایمنی',
  '۲۱ مرداد — عید سعید غدیر خم',
  '۲۳ مرداد — روز مقاومت اسلامی',
  '۲۸ مرداد — سالروز فاجعه هفده شهریور',
  '۳۱ مرداد — روز صنعت دفاعی',
  '۲ شهریور — روز زن و خانواده',
  '۴ شهریور — روز کارمند',
];

function formatDate(dateStr: string | null) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const min = Math.floor(diff / 60000);
  const hr = Math.floor(diff / 3600000);
  if (min < 1) return 'همین الان';
  if (min < 60) return `${min} دقیقه پیش`;
  if (hr < 24) return `${hr} ساعت پیش`;
  return d.toLocaleDateString('fa-IR');
}

const gradientByCategory: Record<string, string> = {
  'ملی': 'from-blue-600 to-blue-800',
  'بوشهر': 'from-emerald-600 to-emerald-800',
  'سیاسی': 'from-blue-500 to-blue-700',
  'اقتصادی': 'from-emerald-500 to-emerald-700',
  'اجتماعی': 'from-orange-500 to-orange-700',
  'بین‌الملل': 'from-purple-500 to-purple-700',
  'فناوری': 'from-cyan-500 to-cyan-700',
  'ورزشی': 'from-green-500 to-green-700',
  'اختصاصی': 'from-[#C9A96E] to-[#b8945d]',
};

const bgByCategory: Record<string, string> = {
  'ملی': 'bg-blue-500', 'بوشهر': 'bg-emerald-500', 'سیاسی': 'bg-blue-500',
  'اقتصادی': 'bg-emerald-500', 'اجتماعی': 'bg-orange-500', 'بین‌الملل': 'bg-purple-500',
  'فناوری': 'bg-cyan-500', 'ورزشی': 'bg-green-500', 'اختصاصی': 'bg-[#C9A96E]',
};

export default function HomepageContent() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('');
  const [marketItems, setMarketItems] = useState<MarketItem[]>([]);

  useEffect(() => {
    fetch('/api/homepage')
      .then(r => r.json())
      .then(d => { if (d.success) setData(d.data); })
      .catch(() => {})
      .finally(() => setLoading(false));

    fetch('/api/market')
      .then(r => r.json())
      .then(d => { if (d.items) setMarketItems(d.items); })
      .catch(() => {});
  }, []);

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="inline-block w-10 h-10 border-4 border-[#C9A96E] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const hero = data?.heroMain;
  const side1 = data?.heroSide1;
  const side2 = data?.heroSide2;
  const latest = data?.latest || [];
  const analysis = data?.analysis || [];
  const categoryNews = data?.categoryNews || {};
  const categories = Object.keys(categoryNews);

  return (
    <>
      {/* دکمه شناور ارسال خبر */}
      <a
        href="/submit"
        className="fixed bottom-6 left-6 z-40 flex items-center gap-2 bg-gradient-to-l from-[#C9A96E] to-[#b8945d] text-[#1B365D] px-5 py-3 rounded-full font-bold text-sm shadow-lg hover:shadow-xl hover:scale-105 transition-all"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        ارسال خبر
      </a>

      {/* بازار */}
      {marketItems.length > 0 && (
        <div className="bg-gradient-to-l from-[#1B365D]/5 to-white border border-[#1B365D]/10 rounded-2xl py-4 px-6 mb-10 overflow-hidden shadow-md">
          <div className="absolute top-0 right-0 bottom-0 w-1.5 bg-gradient-to-b from-emerald-500 to-[#1B365D]" />
          <div className="flex items-center gap-5">
            <span className="flex-shrink-0 inline-flex items-center gap-2 bg-gradient-to-l from-emerald-500 to-emerald-600 text-white text-xs px-4 py-2 rounded-full font-black shadow-lg">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
              بازار
            </span>
            <div className="overflow-hidden relative flex-1">
              <div className="flex gap-8 animate-marquee whitespace-nowrap">
                {[...marketItems, ...marketItems].map((item, index) => (
                  <span key={index} className="text-sm font-bold flex items-center gap-2">
                    <span className="text-gray-700">{item.label}</span>
                    <span className="text-[#1B365D]">{item.value}</span>
                    {item.change && (
                      <span className={item.trend === 'up' ? 'text-emerald-600' : 'text-red-500'}>
                        {item.trend === 'up' ? '▲' : '▼'} {item.change}
                      </span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* تقویم و مناسبت‌ها */}
      <div className="bg-gradient-to-l from-[#1B365D]/5 to-white border border-[#1B365D]/10 rounded-2xl py-5 px-6 mb-10 overflow-hidden shadow-md">
        <div className="absolute top-0 right-0 bottom-0 w-1.5 bg-gradient-to-b from-[#C9A96E] to-[#1B365D]" />
        <div className="flex items-center gap-5">
          <span className="flex-shrink-0 inline-flex items-center gap-2 bg-gradient-to-l from-[#C9A96E] to-[#b8945d] text-[#1B365D] text-xs px-4 py-2 rounded-full font-black shadow-lg">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            تقویم و مناسبت‌ها
          </span>
          <div className="overflow-hidden relative flex-1">
            <div className="flex gap-16 animate-marquee whitespace-nowrap">
              {[...calendarEvents, ...calendarEvents].map((event, index) => (
                <span key={index} className="text-gray-700 font-bold text-sm flex items-center gap-3">
                  <span className="text-[#C9A96E] text-lg">◆</span>{event}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="mb-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-8">
            {hero ? (
              <a href={hero.link} target="_blank" rel="noopener noreferrer" className="block group relative rounded-2xl overflow-hidden h-[420px] bg-gradient-to-br from-[#1B365D] to-[#0f1d35]">
                {hero.image && <img src={hero.image} alt={hero.title} className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-50 transition-opacity" />}
                <div className="absolute inset-0 bg-gradient-to-t from-[#1B365D] via-[#1B365D]/40 to-transparent z-10" />
                <div className="absolute inset-0 bg-gradient-to-l from-[#1B365D]/60 to-transparent z-10" />
                <div className="absolute top-5 right-5 z-20 flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 bg-gradient-to-l from-[#C9A96E] to-[#d4b87a] text-[#1B365D] text-xs px-4 py-2 rounded-full font-black shadow-lg">
                    {hero.isCustom ? 'خبر اختصاصی لیان دید' : 'ویژه'}
                  </span>
                  {!hero.isCustom && (
                    <span className="inline-flex items-center gap-1 bg-black/40 backdrop-blur-sm text-white text-[11px] px-3 py-1.5 rounded-full font-bold">
                      📰 {hero.sourceName}
                    </span>
                  )}
                </div>
                <div className="absolute bottom-0 right-0 left-0 p-7 z-20">
                  <div className="max-w-2xl">
                    <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-white mb-3 leading-relaxed group-hover:text-[#C9A96E] transition-colors duration-300">{hero.title}</h1>
                    <p className="text-white/70 text-sm md:text-base line-clamp-2 mb-4 leading-relaxed">{hero.description}</p>
                    <div className="flex items-center gap-4 text-xs text-white/50">
                      <span>{formatDate(hero.publishedAt)}</span>
                      <span className="w-1 h-1 bg-[#C9A96E] rounded-full" />
                      <span>منبع: {hero.sourceName}</span>
                    </div>
                  </div>
                </div>
              </a>
            ) : (
              <div className="rounded-2xl h-[420px] bg-gradient-to-br from-[#1B365D] to-[#0f1d35] flex items-center justify-center"><p className="text-white/50">خبری موجود نیست - از داشبورد انتخاب کنید</p></div>
            )}
          </div>
          <div className="lg:col-span-4 flex flex-col gap-5">
            {[side1, side2].map((news, i) => news ? (
              <a key={news.id} href={news.link} target="_blank" rel="noopener noreferrer" className={`block group relative rounded-2xl overflow-hidden h-[200px] bg-gradient-to-br ${gradientByCategory[news.category || ''] || (i === 0 ? 'from-blue-600 to-blue-800' : 'from-emerald-600 to-emerald-800')}`}>
                {news.image && <img src={news.image} alt={news.title} className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:opacity-40 transition-opacity" />}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent z-10" />
                <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
                  <span className="bg-white text-gray-800 text-xs px-3 py-1.5 rounded-full font-bold shadow-md">{news.category || news.sourceName}</span>
                  {!news.isCustom && <span className="bg-black/40 backdrop-blur-sm text-white text-[10px] px-2 py-1 rounded-full font-bold">{news.sourceName}</span>}
                </div>
                <div className="absolute bottom-0 right-0 left-0 p-5 z-20">
                  <h3 className="text-lg font-black text-white group-hover:text-gray-200 transition-colors duration-300 line-clamp-2 leading-relaxed">{news.title}</h3>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-white/60">{formatDate(news.publishedAt)}</span>
                    <span className="text-[10px] text-white/40">|</span>
                    <span className="text-[10px] text-[#C9A96E] font-bold">📰 {news.sourceName}</span>
                  </div>
                </div>
              </a>
            ) : (
              <div key={i} className="rounded-2xl h-[200px] bg-gray-100 flex items-center justify-center"><p className="text-gray-400 text-sm">خبر موجود نیست</p></div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest News */}
      {latest.length > 0 && (
        <section className="mt-8">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-1 h-7 bg-red-600 rounded-full" />
            <h2 className="text-xl font-black">آخرین اخبار</h2>
          </div>
          <div className="space-y-4">
            {latest.map((news: SlotNews, index: number) => (
              <a key={news.id} href={news.link} target="_blank" rel="noopener noreferrer" className="block group bg-white rounded-2xl border border-gray-100 hover:border-[#C9A96E]/30 p-5 transition-all duration-300 hover:shadow-lg hover:shadow-[#1B365D]/5">
                <div className="flex items-center gap-5">
                  <div className={`flex-shrink-0 w-14 h-14 rounded-xl ${bgByCategory[news.category || ''] || 'bg-[#1B365D]'} flex items-center justify-center shadow-lg`}>
                    <span className="text-2xl font-black text-white">{String(index + 1).padStart(2, '0')}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold tracking-wider text-white ${bgByCategory[news.category || ''] || 'bg-[#1B365D]'}`}>{news.category || news.sourceName}</span>
                      {!news.isCustom && <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-gray-100 text-gray-600">📰 {news.sourceName}</span>}
                      {news.isCustom && <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-[#C9A96E]/10 text-[#C9A96E]">اختصاصی لیان دید</span>}
                    </div>
                    <h3 className="font-black text-[#1B365D] group-hover:text-[#C9A96E] transition-colors duration-300 text-lg leading-relaxed line-clamp-1">{news.title}</h3>
                  </div>
                  <div className="hidden sm:flex flex-col items-end gap-2 text-sm text-gray-400 flex-shrink-0">
                    <span>{formatDate(news.publishedAt)}</span>
                    <span className="text-xs">{news.sourceName}</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Analysis */}
      {analysis.length > 0 && (
        <section className="mt-14">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-1.5 h-10 bg-gradient-to-b from-[#1B365D] to-[#C9A96E] rounded-full" />
              <h2 className="text-2xl font-black text-[#1B365D]">تحلیل‌ها</h2>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {analysis.map((news: SlotNews) => (
              <a key={news.id} href={news.link} target="_blank" rel="noopener noreferrer" className="group block bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-[#C9A96E]/30 transition-all duration-300 hover:shadow-xl hover:shadow-[#1B365D]/10">
                <div className={`relative h-52 bg-gradient-to-br ${gradientByCategory[news.category || ''] || 'from-[#1B365D] to-[#2a4a7a]'} overflow-hidden`}>
                  {news.image && <img src={news.image} alt={news.title} className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:opacity-40 transition-opacity" />}
                  <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
                    <span className="inline-block text-xs px-3 py-1.5 rounded-full font-bold shadow-md bg-white text-gray-800">{news.category || news.sourceName}</span>
                    {!news.isCustom && <span className="bg-black/40 backdrop-blur-sm text-white text-[10px] px-2 py-1 rounded-full font-bold">📰 {news.sourceName}</span>}
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-black text-[#1B365D] group-hover:text-[#C9A96E] transition-colors duration-300 mb-3 line-clamp-2 leading-relaxed">{news.title}</h3>
                  <p className="text-gray-500 text-sm line-clamp-2 mb-4 leading-relaxed">{news.description}</p>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <span className="text-sm font-bold text-[#1B365D]">{news.sourceName}</span>
                    <span className="text-xs text-gray-400">{formatDate(news.publishedAt)}</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Category Tabs */}
      {categories.length > 0 && (
        <section className="mt-14">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-1.5 h-10 bg-gradient-to-b from-[#C9A96E] to-[#1B365D] rounded-full" />
            <h2 className="text-2xl font-black text-[#1B365D]">اخبار دسته‌بندی‌شده</h2>
          </div>
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveTab(activeTab === cat ? '' : cat)}
                className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
                  activeTab === cat
                    ? 'bg-[#1B365D] text-[#C9A96E]'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat}
                {categoryNews[cat] && <span className="mr-1.5 text-xs opacity-60">({categoryNews[cat].length})</span>}
              </button>
            ))}
          </div>
          {activeTab && categoryNews[activeTab] && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {categoryNews[activeTab].map((news: SlotNews) => (
                <a key={news.id} href={news.link} target="_blank" rel="noopener noreferrer" className="group block bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-[#C9A96E]/30 transition-all duration-300 hover:shadow-xl hover:shadow-[#1B365D]/10">
                  <div className={`relative h-44 bg-gradient-to-br ${gradientByCategory[activeTab] || 'from-[#1B365D] to-[#2a4a7a]'} overflow-hidden`}>
                    {news.image && <img src={news.image} alt={news.title} className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:opacity-40 transition-opacity" />}
                    <div className="absolute top-3 right-3 z-20">
                      <span className="text-xs px-3 py-1.5 rounded-full font-bold shadow-md bg-white text-gray-800">{activeTab}</span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-black text-[#1B365D] group-hover:text-[#C9A96E] transition-colors duration-300 mb-2 line-clamp-2 leading-relaxed">{news.title}</h3>
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <span className="text-xs font-bold text-[#1B365D]">{news.sourceName}</span>
                      <span className="text-xs text-gray-400">{formatDate(news.publishedAt)}</span>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )}
        </section>
      )}
    </>
  );
}