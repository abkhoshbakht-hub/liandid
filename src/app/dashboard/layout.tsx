'use client';

import { useEffect, useState, Suspense } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import SitePreview from '@/components/dashboard/SitePreview';

interface SidebarItem {
  href: string;
  label: string;
}

interface SidebarSection {
  title: string;
  preview: string;
  icon: React.ReactNode;
  items: SidebarItem[];
}

const sections: SidebarSection[] = [
  { title: 'تنظیمات هدر', preview: 'header', icon: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h7" /></svg>
  ), items: [
    { href: '/dashboard/header?section=logo', label: 'لوگو' },
    { href: '/dashboard/header?section=license', label: 'پروانه انتشار' },
    { href: '/dashboard/header?section=about', label: 'درباره ما' },
    { href: '/dashboard/header?section=contact', label: 'تماس با ما' },
    { href: '/dashboard/header?section=search', label: 'جستجو' },
    { href: '/dashboard/header?section=nav', label: 'منوی ناوبری' },
    { href: '/dashboard/social', label: 'شبکه\u200cهای اجتماعی' },
  ]},
  { title: 'صفحه اصلی', preview: 'homepage', icon: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
  ), items: [
    { href: '/dashboard/homepage?section=hero', label: 'هیرو' },
    { href: '/dashboard/homepage?section=latest', label: 'آخرین اخبار' },
    { href: '/dashboard/homepage?section=analysis', label: 'تحلیل خبر' },
    { href: '/dashboard/events', label: 'مناسبت\u200cهای تقویمی' },
    { href: '/dashboard/external-news', label: 'اخبار لحظه\u200cای' },
  ]},
  { title: 'تب\u200cهای سایت', preview: 'header', icon: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
  ), items: [
    { href: '/dashboard/articles?cat=siyasi', label: 'سیاسی' },
    { href: '/dashboard/articles?cat=eghtesadi', label: 'اقتصادی' },
    { href: '/dashboard/articles?cat=ejtemaei', label: 'اجتماعی' },
    { href: '/dashboard/articles?cat=beynolmelal', label: 'بین\u200cالملل' },
    { href: '/dashboard/articles?cat=fanavari', label: 'فناوری' },
    { href: '/dashboard/articles?cat=varzeshi', label: 'ورزشی' },
    { href: '/dashboard/articles?cat=farhangi', label: 'فرهنگی' },
    { href: '/dashboard/articles?cat=elmi', label: 'علمی' },
    { href: '/dashboard/gallery', label: 'گالری' },
  ]},
  { title: 'صفحات ایستا', preview: 'staticpages', icon: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
  ), items: [
    { href: '/dashboard/static-pages', label: 'ویرایش صفحات' },
    { href: '/about/launch', label: 'پیام مدیر مسئول' },
  ]},
  { title: 'اخبار', preview: 'articles', icon: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>
  ), items: [
    { href: '/dashboard/articles', label: 'اخبار سایت' },
    { href: '/dashboard/submissions', label: 'ارسالی مخاطبین' },
  ]},
  { title: 'مدیریت', preview: 'categories', icon: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
  ), items: [
    { href: '/dashboard/categories', label: 'دسته\u200cبندی\u200cها' },
    { href: '/dashboard/regions', label: 'شهرها' },
    { href: '/dashboard/comments', label: 'نظرات' },
    { href: '/dashboard/subscribers', label: 'خبرنامه' },
    { href: '/dashboard/users', label: 'کاربران' },
    { href: '/dashboard/media', label: 'رسانه' },
  ]},
  { title: 'فوتر', preview: 'footer', icon: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
  ), items: [
    { href: '/dashboard/footer', label: 'تنظیمات فوتر' },
  ]},
  { title: 'راهنما', preview: 'help', icon: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
  ), items: [
    { href: '/dashboard/help', label: 'آموزش و راهنما' },
    { href: '/admin-guide.html', label: 'راهنمای PDF' },
  ]},
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#0f1d35]"><div className="w-10 h-10 border-2 border-[#C9A96E] border-t-[#1B365D] rounded-full animate-spin" /></div>}>
      <DashboardLayoutInner children={children} />
    </Suspense>
  );
}

function DashboardLayoutInner({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isAdmin, isLoading, user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const catSlug = searchParams.get('cat');
  const sectionParam = searchParams.get('section');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const isActive = (item: SidebarItem): boolean => {
    if (item.href.includes('?cat=')) {
      const catPart = item.href.split('?cat=')[1];
      return (pathname.startsWith('/dashboard/articles') || pathname.startsWith('/dashboard/categories')) && catSlug === catPart;
    }
    if (item.href.includes('?section=')) {
      const secPart = item.href.split('section=')[1];
      return pathname === item.href.split('?')[0] && sectionParam === secPart;
    }
    return pathname === item.href;
  };

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isAdmin)) {
      router.push('/secure-a2x-admin');
    }
  }, [isAuthenticated, isAdmin, isLoading, router]);

  useEffect(() => {
    if (!initialized) {
      for (const s of sections) {
        if (s.items.some(i => isActive(i))) {
          setExpanded(s.title);
          setInitialized(true);
          return;
        }
      }
      setInitialized(true);
    }
  }, [initialized]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname, searchParams]);

  if (isLoading || !isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f1d35]">
        <div className="w-10 h-10 border-2 border-[#C9A96E] border-t-[#1B365D] rounded-full animate-spin" />
      </div>
    );
  }

  const pageTitle = (() => {
    for (const s of sections) {
      const found = s.items.find(i => isActive(i));
      if (found) return found.label;
    }
    return 'داشبورد';
  })();

  const isSectionActive = (section: SidebarSection): boolean => {
    return section.items.some(i => isActive(i));
  };

  const toggleSection = (title: string) => {
    setExpanded(prev => prev === title ? null : title);
  };

  return (
    <div className="min-h-screen bg-[#f8f9fb] flex" dir="rtl">
      <aside className="fixed inset-y-0 right-0 z-50 w-72 bg-[#0a1220] flex flex-col shadow-2xl shadow-black/30">
        <div className="h-16 flex items-center px-5 border-b border-white/[0.04]">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="h-8 w-24 relative">
              <Image src="/logo.png" alt="لیان دید" fill className="object-contain object-right" sizes="96px" />
            </div>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto py-3 px-3">
          {sections.map(s => {
            const isOpen = expanded === s.title;
            return (
              <div key={s.title} className="mb-1.5">
                <div className="flex items-center">
                  <button
                    onClick={() => toggleSection(s.title)}
                    className={`flex-1 flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                      isOpen ? 'bg-white/[0.06]' : 'hover:bg-white/[0.03]'
                    }`}
                  >
                    <span className={`transition-colors duration-200 ${isOpen ? 'text-[#C9A96E]' : 'text-white/20 group-hover:text-white/30'}`}>
                      {s.icon}
                    </span>
                    <span className={`text-[12px] font-bold transition-colors duration-200 ${
                      isOpen ? 'text-white/80' : 'text-white/35 group-hover:text-white/50'
                    }`}>{s.title}</span>
                    {isSectionActive(s) && !isOpen && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#C9A96E] mr-auto" />
                    )}
                    <svg
                      className={`w-3 h-3 transition-transform duration-300 ${isOpen ? 'text-white/30 rotate-0' : 'text-white/10 rotate-180'}`}
                      fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setPreview(preview === s.title ? null : s.title); }}
                    className="p-1.5 rounded-lg hover:bg-white/5 transition-colors ml-0.5"
                    title="پیش\u200cنمایش"
                  >
                    <svg className={`w-3.5 h-3.5 transition-colors ${preview === s.title ? 'text-[#C9A96E]' : 'text-white/10 hover:text-white/25'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                </div>

                <div className={`overflow-hidden transition-all duration-300 ease-out ${isOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="mr-5 mt-1 mb-2 pl-2 border-r border-white/[0.04]">
                    {s.items.map((item, i) => {
                      const activeItem = isActive(item);
                      return (
                        <Link
                          key={item.label + i}
                          href={item.href}
                          onMouseEnter={() => setHoveredItem(item.label)}
                          onMouseLeave={() => setHoveredItem(null)}
                          className={`relative flex items-center px-3 py-[7px] rounded-lg text-[11.5px] transition-all duration-150 my-0.5 ${
                            activeItem
                              ? 'bg-[#C9A96E]/[0.12] text-[#C9A96E] font-bold'
                              : 'text-white/30 hover:text-white/60 hover:bg-white/[0.03]'
                          }`}
                        >
                          {activeItem && (
                            <span className="absolute -right-[9px] top-1/2 -translate-y-1/2 w-[3px] h-4 bg-[#C9A96E] rounded-full" />
                          )}
                          {item.label}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </nav>

        <div className="px-4 py-3 border-t border-white/[0.04]">
          <div className="flex items-center gap-2.5 px-1 mb-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#C9A96E] to-[#8a6d3b] flex items-center justify-center text-white font-black text-xs shadow-lg shadow-[#C9A96E]/20">
              {user?.name?.[0] || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-[11px] font-bold truncate">{user?.name}</p>
              <p className="text-white/25 text-[10px]">{user?.role === 'ADMIN' ? 'مدیر ارشد' : 'نویسنده'}</p>
            </div>
          </div>
          <div className="flex gap-1.5">
            <a href="/" target="_blank" className="flex-1 flex items-center justify-center gap-1.5 text-[10px] text-white/25 hover:text-white/60 py-2 rounded-lg hover:bg-white/[0.03] transition-colors border border-white/[0.04]">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
              مشاهده سایت
            </a>
            <button onClick={logout} className="flex-1 flex items-center justify-center gap-1.5 text-[10px] text-white/25 hover:text-red-400 py-2 rounded-lg hover:bg-white/[0.03] transition-colors border border-white/[0.04]">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              خروج
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 lg:mr-72 min-h-screen">
        <header className="sticky top-0 z-30 h-14 bg-white/80 backdrop-blur-xl border-b border-gray-200/60 flex items-center px-6">
          <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden ml-4 p-2 rounded-lg hover:bg-gray-100">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
          <h2 className="text-sm font-bold text-gray-800">{pageTitle}</h2>
          <div className="mr-auto flex items-center gap-3">
            <Link href="/dashboard/shutdown" className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold text-red-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-red-100">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              خاموش کردن
            </Link>
            <span className="text-xs text-gray-400">{new Date().toLocaleDateString('fa-IR')}</span>
          </div>
        </header>
        <main className="p-6">{children}</main>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-[60] bg-black/50 lg:hidden" onClick={() => setMobileOpen(false)}>
          <div className="absolute inset-y-0 right-0 w-72 bg-[#0a1220] shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="h-16 flex items-center px-5 border-b border-white/[0.04]">
              <Link href="/dashboard" onClick={() => setMobileOpen(false)}>
                <div className="h-8 w-24 relative">
                  <Image src="/logo.png" alt="لیان دید" fill className="object-contain object-right" sizes="96px" />
                </div>
              </Link>
            </div>
            <nav className="overflow-y-auto py-3 px-3 h-[calc(100vh-4rem)]">
              {sections.map(s => {
                const isOpen = expanded === s.title;
                return (
                  <div key={s.title} className="mb-1.5">
                    <button
                      onClick={() => toggleSection(s.title)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                        isOpen ? 'bg-white/[0.06]' : 'hover:bg-white/[0.03]'
                      }`}
                    >
                      <span className={isOpen ? 'text-[#C9A96E]' : 'text-white/20'}>{s.icon}</span>
                      <span className={`text-[12px] font-bold ${isOpen ? 'text-white/80' : 'text-white/35'}`}>{s.title}</span>
                      <svg className={`w-3 h-3 mr-auto transition-transform duration-300 ${isOpen ? 'text-white/30 rotate-0' : 'text-white/10 rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'}`}>
                      <div className="mr-5 mt-1 mb-2 pl-2 border-r border-white/[0.04]">
                        {s.items.map((item, i) => {
                          const activeItem = isActive(item);
                          return (
                            <Link key={item.label + i} href={item.href} onClick={() => setMobileOpen(false)}
                              className={`relative block px-3 py-[7px] rounded-lg text-[11.5px] my-0.5 ${
                                activeItem ? 'bg-[#C9A96E]/[0.12] text-[#C9A96E] font-bold' : 'text-white/30 hover:text-white/60 hover:bg-white/[0.03]'
                              }`}
                            >
                              {activeItem && <span className="absolute -right-[9px] top-1/2 -translate-y-1/2 w-[3px] h-4 bg-[#C9A96E] rounded-full" />}
                              {item.label}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {preview && (
        <div className="fixed inset-0 z-[100] bg-black/40 flex items-center justify-center p-8" onClick={() => setPreview(null)}>
          <div className="bg-[#0f1d35] rounded-2xl border border-white/10 w-full max-w-[1200px] max-h-[90vh] shadow-2xl overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-[#C9A96E]" />
                <span className="text-white text-base font-bold">{preview}</span>
              </div>
              <button onClick={() => setPreview(null)} className="text-white/40 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-8 overflow-y-auto flex-1">
              <SitePreview
                type={sections.find(s => s.title === preview)?.preview || ''}
                activeLabel={hoveredItem || undefined}
                go={(href: string) => {
                  setPreview(null);
                  router.push(href);
                }}
              />
            </div>
            <div className="px-6 py-3 border-t border-white/10 flex-shrink-0">
              <p className="text-xs text-white/40 text-center">پیش\u200cنمایش ساختار این بخش</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
