'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import MarketTicker from '@/components/news/MarketTicker';

const categories: Array<{name: string; slug: string; href?: string; subcategories?: Array<{name: string; slug: string; href?: string}>}> = [
  { name: 'صفحه اصلی', slug: 'home', href: '/' },
  {
    name: 'سیاسی',
    slug: 'siyasi',
    subcategories: [
      { name: 'رهبری', slug: 'rahbari' },
      { name: 'دولت', slug: 'dolat' },
      { name: 'مجلس', slug: 'majles' },
      { name: 'سیاست خارجی', slug: 'siyasat-khareji' },
      { name: 'احزاب و تشکل‌ها', slug: 'ahzab' },
      { name: 'امنیت و دفاع', slug: 'amniyat-defa' },
    ],
  },
  {
    name: 'اقتصادی',
    slug: 'eghtesadi',
    subcategories: [
      { name: 'اقتصاد ایران', slug: 'eghtesad-iran' },
      { name: 'اقتصاد جهان', slug: 'eghtesad-jahan' },
      { name: 'بورس و بازار سرمایه', slug: 'bours' },
      { name: 'مسکن و ساختمان', slug: 'maskan' },
      { name: 'انرژی', slug: 'energy' },
      { name: 'کشاورزی و صنعت', slug: 'keshavarzi-sanat' },
    ],
  },
  {
    name: 'اجتماعی',
    slug: 'ejtemaei',
    subcategories: [
      { name: 'حوادث', slug: 'havades' },
      { name: 'بهداشت و درمان', slug: 'behdasht' },
      { name: 'آموزش و پرورش', slug: 'amoozesh' },
      { name: 'گردشگری', slug: 'gardeshgari' },
      { name: 'محیط زیست', slug: 'mahiat-zist' },
      { name: 'قضایی و حقوقی', slug: 'ghazayi' },
    ],
  },
  {
    name: 'بین‌الملل',
    slug: 'beynolmelal',
    subcategories: [
      { name: 'خاورمیانه', slug: 'khavarmianeh' },
      { name: 'آسیا', slug: 'asia' },
      { name: 'اروپا', slug: 'oropa' },
      { name: 'آمریکا', slug: 'amrika' },
      { name: 'بین‌الملل (عمومی)', slug: 'beynolmelal-omoomi' },
    ],
  },
  { name: 'فناوری', slug: 'fanavari', subcategories: [
    { name: 'هوش مصنوعی', slug: 'ai' },
    { name: 'موبایل و تبلت', slug: 'mobile' },
    { name: 'شبکه‌های اجتماعی', slug: 'social' },
    { name: 'گجت و تکنولوژی', slug: 'gadget' },
    { name: 'نرم‌افزار و اپلیکیشن', slug: 'software' },
  ]},
  {
    name: 'ورزشی',
    slug: 'varzeshi',
    subcategories: [
      { name: 'فوتبال ایران', slug: 'footbal-iran' },
      { name: 'فوتبال جهان', slug: 'footbal-jahan' },
      { name: 'کشتی و وزنه‌برداری', slug: 'koshti' },
      { name: 'ورزش‌های رزمی', slug: 'varzesh-ha-razmi' },
      { name: 'نتایج زنده', slug: 'natayej-zende' },
    ],
  },
  { name: 'فرهنگی', slug: 'farhangi', subcategories: [
    { name: 'سینما و تلویزیون', slug: 'sinama' },
    { name: 'موسیقی', slug: 'moosighi' },
    { name: 'ادبیات و کتاب', slug: 'adabiat' },
    { name: 'هنرهای تجسمی', slug: 'honar' },
    { name: 'تئاتر', slug: 'teatr' },
  ]},
  { name: 'علمی', slug: 'elmi', subcategories: [
    { name: 'پزشکی و سلامت', slug: 'pezeshki' },
    { name: 'نجوم و فضا', slug: 'nojoom' },
    { name: 'محیط زیست', slug: 'mahiat' },
    { name: 'اختراعات', slug: 'ekhtera' },
    { name: 'دانشگاه و پژوهش', slug: 'daneshgah' },
  ]},
  { name: 'گالری', slug: 'gallery', subcategories: [
    { name: 'عکس', slug: 'photos', href: '/gallery' },
    { name: 'فیلم', slug: 'videos', href: '/gallery/videos' },
  ]},
];



const breakingNews = [
  'واکنش وزیر خارجه به آخرین تحولات مذاکرات هسته‌ای',
  'قیمت دلار و سکه در بازار امروز',
  'نتایج نهایی مسابقات ورزشی کشور',
  'هشدار هواشناسی نسبت به ورود سامانه بارشی جدید',
];

export default function Header({ breakingItems = [] }: { breakingItems?: Array<{id: string; title: string; link: string}> }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const [currentNews, setCurrentNews] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [settings, setSettings] = useState<Record<string, string>>({});
  const router = useRouter();

  useEffect(() => {
    fetch('/api/admin/settings').then(r => r.json()).then(setSettings).catch(() => {});
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentNews((prev) => (prev + 1) % breakingNews.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="relative z-50">
      {/* هدر اصلی */}
      <div className="relative bg-white overflow-hidden h-[120px] lg:h-[200px]">
        <Image src="/هدر لیان دید 3.png" alt="هدر لیان دید" fill className="object-cover object-right lg:object-center" priority />
        <div className="absolute z-20 bottom-3 right-12 lg:bottom-auto lg:right-auto lg:left-1/2 lg:-translate-x-1/2 lg:top-[170px]">
          <span className="text-[9px] lg:text-[10px] font-bold text-[#1B365D] drop-shadow-[0_1px_2px_rgba(255,255,255,0.8)]" style={{ whiteSpace: 'nowrap' }}>— پروانه انتشار: {settings.license || '۹۶۲۲'} —</span>
        </div>
        <div className="site-container h-full flex items-center justify-between relative z-10">

          {/* سمت راست: خروج */}
          <div className="flex items-center gap-3">
            {isAuthenticated && isAdmin && (
              <button onClick={logout} className="px-4 py-2 text-sm text-gray-500 hover:text-red-500 hover:bg-red-50 border border-gray-200 rounded-lg transition-all">
                خروج
              </button>
            )}
          </div>

          {/* سمت چپ: جستجو و لینک‌ها */}
          <div className="hidden lg:flex flex-col items-end gap-2">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (searchQuery.trim()) {
                  router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
                }
              }}
              className="relative flex"
            >
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={settings.searchPlaceholder || "جستجو در اخبار..."}
                className="w-48 pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:border-[#C9A96E] focus:ring-2 focus:ring-[#C9A96E]/10 transition-all placeholder:text-gray-400"
              />
              <button type="submit" className="absolute left-1 top-1/2 -translate-y-1/2 w-7 h-7 bg-[#1B365D] rounded-md flex items-center justify-center hover:bg-[#2a4a7a] transition-colors">
                <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </button>
            </form>
            <Link href={settings.aboutLink || '/about'} className="text-[12px] text-[#1B365D] hover:text-[#C9A96E] transition-colors font-bold">{settings.aboutText || 'درباره ما'}</Link>
            <Link href={settings.contactLink || '/contact'} className="text-[12px] text-[#1B365D] hover:text-[#C9A96E] transition-colors font-bold">{settings.contactText || 'تماس با ما'}</Link>
            <div className="flex items-center gap-3">
              <a href={settings.telegram || 'https://t.me/liandid'} target="_blank" rel="noopener noreferrer" className="text-[#1B365D]/60 hover:text-[#C9A96E] transition-colors" title="تلگرام">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
              </a>
              <a href={settings.instagram || 'https://instagram.com/liandid'} target="_blank" rel="noopener noreferrer" className="text-[#1B365D]/60 hover:text-[#C9A96E] transition-colors" title="اینستاگرام">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>
              </a>
              <a href={settings.bale || 'https://bale.ai/liandid'} target="_blank" rel="noopener noreferrer" className="text-[#1B365D]/60 hover:text-[#C9A96E] transition-colors" title="بله">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15l-4-4 1.41-1.41L11 14.17l6.59-6.59L19 9l-8 8z"/></svg>
              </a>
            </div>
          </div>

        </div>
      </div>

      {/* نوار تقویم و اخبار فوری */}
      <MarketTicker breakingItems={breakingItems} onMenuToggle={() => setIsMenuOpen(!isMenuOpen)} />

      {/* نوار منو */}
      <nav className="hidden lg:block bg-gradient-to-l from-[#1B365D] via-[#1e3a64] to-[#1B365D] shadow-md">
        <div className="site-container">
          <ul className="flex items-center gap-1">
            {categories.map((cat) => (
              <li
                key={cat.slug}
                className="relative group"
                onMouseEnter={() => cat.subcategories && setOpenDropdown(cat.slug)}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <Link
                  href={'href' in cat && cat.href ? cat.href : `/category/${cat.slug}`}
                  className="px-5 py-2 text-[13px] font-medium text-white/80 hover:text-white hover:bg-white/10 transition-all flex items-center gap-1.5 border-b-2 border-transparent hover:border-[#C9A96E]"
                >
                  {cat.name}
                  {cat.subcategories && (
                    <svg className={`w-3 h-3 transition-transform duration-200 ${openDropdown === cat.slug ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  )}
                </Link>

                {cat.subcategories && openDropdown === cat.slug && (
                  <div className="absolute top-full right-0 w-64 bg-white rounded-b-lg shadow-xl border border-gray-100 z-50 overflow-hidden">
                    <div className="py-3">
                      {cat.subcategories.map((sub, idx) => (
                        <Link
                          key={sub.slug}
                          href={(sub as any).href || `/category/${cat.slug}/${sub.slug}`}
                          className="block px-7 py-3.5 text-[13px] text-gray-600 hover:bg-gradient-to-l hover:from-[#1B365D] hover:to-[#2a4a7a] hover:text-white transition-all border-r-2 border-transparent hover:border-[#C9A96E]"
                          style={{ animationDelay: `${idx * 30}ms` }}
                        >
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                    {'href' in cat && cat.href && (
                    <div className="px-7 py-3.5 bg-gradient-to-l from-gray-50 to-gray-100 border-t border-gray-100">
                      <Link href={cat.href} className="text-xs text-[#1B365D] hover:text-[#C9A96E] font-bold transition-colors flex items-center gap-1">
                        مشاهده همه
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                      </Link>
                    </div>
                    )}
                  </div>
                )}
              </li>
            ))}
            <li
              className="relative group"
              onMouseEnter={() => setOpenDropdown('bushahr')}
              onMouseLeave={() => setOpenDropdown(null)}
            >
              <button className="px-5 py-2 text-[13px] font-medium text-white/80 hover:text-white hover:bg-white/10 transition-all flex items-center gap-1.5 border-b-2 border-transparent hover:border-[#C9A96E]">
                🗺️ اخبار شهرها و روستاهای استان
                <svg className={`w-3 h-3 transition-transform duration-200 ${openDropdown === 'bushahr' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </button>
              {openDropdown === 'bushahr' && (
                <div className="absolute top-full right-0 w-52 bg-white rounded-b-lg shadow-xl border border-gray-100 z-50 overflow-hidden">
                  <Link href="/category/bushahr/cities" className="flex items-center gap-2 px-5 py-3.5 text-[13px] text-gray-600 hover:bg-gradient-to-l hover:from-[#1B365D] hover:to-[#2a4a7a] hover:text-white transition-all border-r-2 border-transparent hover:border-[#C9A96E]">
                    🏙️ شهرها
                  </Link>
                  <Link href="/category/bushahr/villages" className="flex items-center gap-2 px-5 py-3.5 text-[13px] text-gray-600 hover:bg-gradient-to-l hover:from-[#1B365D] hover:to-[#2a4a7a] hover:text-white transition-all border-r-2 border-transparent hover:border-[#C9A96E]">
                    🏡 روستاها
                  </Link>
                </div>
              )}
            </li>
          </ul>
        </div>
      </nav>

      {/* منوی موبایل */}
      {isMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-0 bg-white z-50 overflow-y-auto">
          <div className="bg-gradient-to-l from-[#1B365D] via-[#1e3a64] to-[#1B365D] px-4 py-4 flex justify-between items-center">
            <div className="h-[50px] w-[140px] relative">
              <Image src="/logo.png" alt="لیان دید" fill className="object-contain" sizes="140px" />
            </div>
            <button onClick={() => setIsMenuOpen(false)} className="w-10 h-10 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <div className="p-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (searchQuery.trim()) {
                  setIsMenuOpen(false);
                  router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
                }
              }}
              className="relative mb-4 flex"
            >
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="جستجو..."
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#C9A96E] focus:ring-2 focus:ring-[#C9A96E]/10"
              />
              <button type="submit" className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 hover:text-[#C9A96E] transition-colors">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </button>
            </form>

            <ul className="space-y-0">
              {categories.map((cat) => (
                <li key={cat.slug}>
                  {cat.subcategories ? (
                    <div>
                      <button
                        onClick={() => setOpenDropdown(openDropdown === cat.slug ? null : cat.slug)}
                        className="w-full flex items-center justify-between px-5 py-4 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-all font-medium"
                      >
                        <span className="whitespace-nowrap">{cat.name}</span>
                        <svg className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${openDropdown === cat.slug ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                      </button>
                      {openDropdown === cat.slug && (
                        <div className="mr-5 border-r-2 border-[#C9A96E] pr-5 mb-2">
                          {cat.subcategories.map((sub) => (
                            <Link key={sub.slug} href={(sub as any).href || `/category/${cat.slug}/${sub.slug}`} className="block px-5 py-3 text-sm text-gray-500 hover:text-[#1B365D] transition-colors" onClick={() => setIsMenuOpen(false)}>
                              {sub.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
<Link href={'href' in cat && cat.href ? cat.href : `/category/${cat.slug}`} className="block px-5 py-4 text-sm text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-all" onClick={() => setIsMenuOpen(false)}><span className="whitespace-nowrap">{cat.name}</span></Link>
                  )}
                </li>
              ))}
              <li>
                <button
                  onClick={() => setOpenDropdown(openDropdown === 'bushahr-mobile' ? null : 'bushahr-mobile')}
                  className="w-full flex items-center justify-between px-5 py-4 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-all font-medium"
                >
                  <span>🗺️ اخبار شهرها و روستاهای استان</span>
                  <svg className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${openDropdown === 'bushahr-mobile' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>
                {openDropdown === 'bushahr-mobile' && (
                  <div className="mr-5 border-r-2 border-[#C9A96E] pr-5 mb-2">
                    <Link href="/category/bushahr/cities" className="flex items-center gap-2 px-5 py-3 text-sm text-gray-500 hover:text-[#1B365D] transition-colors" onClick={() => setIsMenuOpen(false)}>
                      🏙️ شهرها
                    </Link>
                    <Link href="/category/bushahr/villages" className="flex items-center gap-2 px-5 py-3 text-sm text-gray-500 hover:text-[#C9A96E] transition-colors" onClick={() => setIsMenuOpen(false)}>
                      🏡 روستاها
                    </Link>
                  </div>
                )}
              </li>
            </ul>
          </div>
        </div>
      )}
    </header>
  );
}
