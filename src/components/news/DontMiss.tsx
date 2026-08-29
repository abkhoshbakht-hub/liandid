'use client';

import Link from 'next/link';

const dontMissNews = [
  {
    id: 1,
    title: 'پیش‌بینی قیمت مسکن در نیمه دوم ۱۴۰۵',
    slug: 'housing-price-forecast',
    category: 'اقتصاد',
    readTime: '۵ دقیقه',
    image: '🏠',
  },
  {
    id: 2,
    title: '۱۰ غذای مفید برای سلامت قلب',
    slug: 'heart-healthy-foods',
    category: 'سلامت',
    readTime: '۳ دقیقه',
    image: '❤️',
  },
  {
    id: 3,
    title: 'راهنمای سفر به بوشهر در تابستان',
    slug: 'bushehr-travel-guide',
    category: 'گردشگری',
    readTime: '۷ دقیقه',
    image: '🏖️',
  },
  {
    id: 4,
    title: 'آموزش برنامه‌نویسی پایتون برای مبتدیان',
    slug: 'python-beginners-guide',
    category: 'فناوری',
    readTime: '۱۰ دقیقه',
    image: '💻',
  },
  {
    id: 5,
    title: 'نتایج لیگ برتر فوتبال ایران',
    slug: 'iranian-football-league',
    category: 'ورزشی',
    readTime: '۴ دقیقه',
    image: '⚽',
  },
];

export default function DontMiss() {
  return (
    <div className="bg-gradient-to-br from-[#1B365D] to-[#0f1d35] rounded-2xl p-6 mb-10 text-white">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-1 h-8 bg-[#C9A96E] rounded-full" />
          <h2 className="text-xl font-black">از دست ندهید</h2>
        </div>
        <Link href="/must-read" className="text-sm text-[#C9A96E] hover:text-white transition-colors">
          مشاهده همه ←
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {dontMissNews.map((news) => (
          <Link
            key={news.id}
            href={`/news/${news.slug}`}
            className="bg-white/10 hover:bg-white/20 rounded-xl p-4 transition-all group"
          >
            <div className="text-4xl mb-3">{news.image}</div>
            <div className="text-xs text-[#C9A96E] font-bold mb-2">{news.category}</div>
            <h3 className="font-bold text-sm mb-2 line-clamp-2 group-hover:text-[#C9A96E] transition-colors">
              {news.title}
            </h3>
            <div className="text-xs text-gray-400">{news.readTime} مطالعه</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
