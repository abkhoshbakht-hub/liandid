'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import NewsletterForm from './NewsletterForm';

const defaultLinks = [
  { name: 'درباره ما', href: '/about' },
  { name: 'تماس با ما', href: '/contact' },
  { name: 'آرشیو اخبار', href: '/archive' },
  { name: 'حریم خصوصی', href: '/privacy' },
  { name: 'قوانین', href: '/terms' },
  { name: 'فید RSS', href: '/api/rss/feed', external: true },
];

export default function Footer() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [categories, setCategories] = useState<{ name: string; slug: string }[]>([]);

  useEffect(() => {
    fetch('/api/admin/settings').then(r => r.json()).then(setSettings).catch(() => {});
    fetch('/api/admin/categories').then(r => r.json()).then(data => {
      if (data.success) setCategories(data.data.map((c: any) => ({ name: c.name, slug: c.slug })));
    }).catch(() => {});
    // لوگوی اعلام وصول پایگاه خبری (e-rasaneh)
    try {
      if (!document.getElementById('erasaneh-seal-script')) {
        const s1 = document.createElement('script');
        s1.id = 'erasaneh-seal-script';
        s1.src = 'https://trustseal.e-rasaneh.ir/trustseal.js';
        s1.async = true;
        s1.onload = () => {
          try {
            const s2 = document.createElement('script');
            s2.text = 'eRasaneh_Trustseal(96227, true);';
            document.body.appendChild(s2);
          } catch {}
        };
        document.body.appendChild(s1);
      }
    } catch {}
  }, []);

  const address = settings.footerAddress || 'بوشهر، امامزاده مهر ۱۸';
  const phone = settings.footerPhone || '۰۹۳۶-۰۲۸-۰۵۶۲';
  const description = settings.footerDescription || 'پایگاه خبری تحلیلی لیان دید\nاخبار لحظه\u200cای استان بوشهر و ایران';

  const footerLinks = (() => {
    try {
      const raw = settings.footerLinks;
      if (raw) return JSON.parse(raw);
    } catch {}
    return defaultLinks;
  })();

  return (
    <footer className="bg-[#0f2440] mt-10 border-t-[3px] border-[#C9A96E]/40 overflow-hidden">
      <div className="site-container py-4">
        <div className="grid grid-cols-2 md:grid-cols-12 gap-4 lg:gap-3 mb-3">
          {/* ستون ۱: لوگو و توضیحات — ۳ ستون */}
          <div className="col-span-2 md:col-span-12 lg:col-span-3 flex flex-col items-center lg:items-start text-center lg:text-right">
            <div className="-mb-2">
              <div id="div_eRasanehTrustseal_96227" className="bg-white rounded p-0.5 inline-block scale-[0.5] origin-center lg:origin-right" />
            </div>
            <p className="text-white/65 text-xs leading-5 whitespace-pre-line max-w-[260px] lg:max-w-none">{description}</p>
            <div className="mt-2 flex flex-wrap items-center justify-center lg:justify-start gap-x-3 gap-y-1 text-[11px] leading-none text-white/45">
              <span className="inline-flex items-center gap-1">
                <svg className="w-3 h-3 text-[#C9A96E] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                {address}
              </span>
              <span className="hidden sm:inline text-white/20">|</span>
              <span className="inline-flex items-center gap-1">
                <svg className="w-3 h-3 text-[#C9A96E] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                <span dir="ltr">{phone}</span>
              </span>
            </div>
          </div>

          {/* ستون ۲: شبکه‌های اجتماعی — ۲ ستون */}
          <div className="text-center lg:text-right md:col-span-4 lg:col-span-2">
            <h3 className="text-[#C9A96E] font-bold text-xs tracking-wider mb-2">شبکه‌های اجتماعی</h3>
            <div className="grid grid-cols-2 gap-1 max-w-[200px] mx-auto lg:mx-0">
              <a href={settings.telegram || 'https://t.me/liandid'} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-1 px-2 py-1 bg-white/[0.06] hover:bg-sky-500 border border-white/10 hover:border-sky-500 text-white/70 hover:text-white rounded text-[11px] font-bold transition-all">
                <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/></svg>
                تلگرام
              </a>
              <a href={settings.instagram || 'https://instagram.com/liandid'} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-1 px-2 py-1 bg-white/[0.06] hover:bg-pink-500 border border-white/10 hover:border-pink-500 text-white/70 hover:text-white rounded text-[11px] font-bold transition-all">
                <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                اینستاگرام
              </a>
              <a href={settings.bale || 'https://bale.ai/liandid'} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-1 px-2 py-1 bg-white/[0.06] hover:bg-blue-600 border border-white/10 hover:border-blue-600 text-white/70 hover:text-white rounded text-[11px] font-bold transition-all">
                <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15l-4-4 1.41-1.41L11 14.17l6.59-6.59L19 9l-8 8z"/></svg>
                بله
              </a>
              <a href={settings.rubika || 'https://rubika.ir/liandid'} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-1 px-2 py-1 bg-white/[0.06] hover:bg-orange-500 border border-white/10 hover:border-orange-500 text-white/70 hover:text-white rounded text-[11px] font-bold transition-all">
                <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M8 8l8 4-8 4V8z" fill="#fff"/></svg>
                روبیکا
              </a>
            </div>
          </div>

          {/* ستون ۳: دسته‌بندی‌ها — ۳ ستون */}
          <div className="hidden md:block md:col-span-4 lg:col-span-3 text-center lg:text-right">
            <h3 className="text-[#C9A96E] font-bold text-xs tracking-wider mb-2">دسته‌بندی‌ها</h3>
            <div className="flex flex-wrap gap-1 justify-center lg:justify-start">
              {categories.filter((c: any) => c.slug !== 'exclusive-news' && c.slug !== 'special-news' && !c.name.includes('اختصاصی') && !c.name.includes('لیان دید')).map((cat) => (
                <Link key={cat.slug} href={`/category/${cat.slug}`} className="text-white/55 hover:text-[#C9A96E] hover:bg-white/[0.06] border border-white/10 hover:border-[#C9A96E]/30 transition-all text-[11px] leading-none px-2.5 py-1.5 rounded-full">
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>

          {/* ستون ۴: لینک‌های مفید — ۲ ستون */}
          <div className="text-center lg:text-right md:col-span-4 lg:col-span-2">
            <h3 className="text-[#C9A96E] font-bold text-xs tracking-wider mb-2">لینک‌های مفید</h3>
            <ul className="grid grid-cols-2 lg:grid-cols-1 gap-x-3 gap-y-1">
              {footerLinks.map((link: any) => (
                <li key={link.name}>
                  {link.external ? (
                    <a href={link.href} target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-[#C9A96E] transition-colors text-xs leading-5 block">
                      {link.name}
                    </a>
                  ) : (
                    <Link href={link.href} className="text-white/60 hover:text-[#C9A96E] transition-colors text-xs leading-5 block">
                      {link.name}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* ستون ۵: خبرنامه — فشرده */}
          <div className="col-span-2 md:col-span-12 lg:col-span-2 text-center lg:text-right border-t lg:border-t-0 border-white/10 pt-3 lg:pt-0">
            <h3 className="text-[#C9A96E] font-bold text-xs tracking-wider mb-1.5">خبرنامه</h3>
            <p className="text-white/50 text-[11px] leading-4 mb-2 hidden lg:block">آخرین اخبار را در ایمیل خود دریافت کنید</p>
            <NewsletterForm />
            <div className="mt-2 flex justify-center lg:justify-start">
              <div id="div_eRasanehTrustseal_96227" className="bg-white rounded p-0.5 inline-block scale-[0.55] origin-center lg:origin-right" />
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-2.5 flex flex-col sm:flex-row justify-between items-center gap-2 text-[11px] leading-none">
          <p className="text-white/40 text-center sm:text-right leading-4">
            © {new Date().getFullYear()} {settings.footerCopyright || 'تمامی حقوق مطالب برای «پایگاه خبری تحلیلی لیان دید» محفوظ است و هرگونه کپی‌برداری بدون ذکر منبع ممنوع می‌باشد.'}
          </p>
          <a href="https://liandesign.ir" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-white/40 hover:text-[#C9A96E] transition-colors shrink-0">
            <Image src="/liandesign.logo.png" alt="لیان دیزاین" width={28} height={28} className="rounded-sm" />
            <span>طراحی و تولید: <span className="font-bold text-white/60">لیان دیزاین</span></span>
          </a>
        </div>
      </div>
    </footer>
  );
}
