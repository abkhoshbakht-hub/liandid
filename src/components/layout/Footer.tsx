'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import NewsletterForm from './NewsletterForm';

const defaultLinks = [
  { name: 'درباره ما', href: '/about' },
  { name: 'تماس با ما', href: '/contact' },
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
    <footer className="bg-[#0f2440] mt-12 overflow-hidden">
      <div className="site-container py-5">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5 mb-5">
          {/* ستون اول: لوگو و توضیحات */}
          <div className="text-center">
            <Link href="/" className="inline-block mb-2">
              <div className="h-[70px] w-[160px] relative">
                <Image src="/logo.png" alt="لیان دید" fill className="object-contain object-right" sizes="180px" />
              </div>
            </Link>
            <p className="text-white/70 text-sm leading-6 whitespace-pre-line">{description}</p>
            <div className="mt-3 space-y-1 text-sm">
              <div className="flex items-center justify-center gap-2 text-white/50">
                <svg className="w-3.5 h-3.5 text-[#C9A96E]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                {address}
              </div>
              <div className="flex items-center justify-center gap-2 text-white/50">
                <svg className="w-3.5 h-3.5 text-[#C9A96E]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                <span dir="ltr">{phone}</span>
              </div>
            </div>
          </div>

          {/* ستون دوم: شبکه‌های اجتماعی */}
          <div className="text-center md:text-right">
            <h3 className="text-[#C9A96E] font-black text-base mb-2">شبکه‌های اجتماعی</h3>
            <div className="flex flex-col gap-2 w-fit mx-auto md:mx-0">
              <a href={settings.telegram || 'https://t.me/liandid'} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-2 bg-sky-500/20 hover:bg-sky-500 text-sky-400 hover:text-white rounded-lg text-sm font-bold transition-all" title="تلگرام">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/></svg>
                تلگرام
              </a>
              <a href={settings.instagram || 'https://instagram.com/liandid'} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-2 bg-pink-500/20 hover:bg-pink-500 text-pink-400 hover:text-white rounded-lg text-sm font-bold transition-all" title="اینستاگرام">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                اینستاگرام
              </a>
              <a href={settings.bale || 'https://bale.ai/liandid'} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-2 bg-blue-500/20 hover:bg-blue-500 text-blue-400 hover:text-white rounded-lg text-sm font-bold transition-all" title="بله">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15l-4-4 1.41-1.41L11 14.17l6.59-6.59L19 9l-8 8z"/></svg>
                بله
              </a>
              <a href={settings.rubika || 'https://rubika.ir/liandid'} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-2 bg-orange-500/20 hover:bg-orange-500 text-orange-400 hover:text-white rounded-lg text-sm font-bold transition-all" title="روبیکا">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M8 8l8 4-8 4V8z" fill="#fff"/></svg>
                روبیکا
              </a>
            </div>
          </div>

          {/* ستون سوم: دسته‌بندی‌ها */}
          <div className="text-center hidden md:block">
            <h3 className="text-[#C9A96E] font-black text-base mb-2">دسته‌بندی‌ها</h3>
            <div className="grid grid-cols-4 gap-2">
              {categories.filter((c: any) => c.slug !== 'exclusive-news' && c.slug !== 'special-news' && !c.name.includes('اختصاصی') && !c.name.includes('لیان دید')).map((cat) => (
                <Link key={cat.slug} href={`/category/${cat.slug}`} className="text-white/50 hover:text-[#C9A96E] hover:bg-white/5 transition-all text-xs px-2 py-1.5 rounded-lg border border-white/10 hover:border-[#C9A96E]/30 text-center flex items-center justify-center">
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>

          {/* ستون چهارم: لینک‌های مفید */}
          <div className="text-center">
            <h3 className="text-[#C9A96E] font-black text-base mb-2">لینک‌های مفید</h3>
            <ul className="space-y-1.5">
              {footerLinks.map((link: any) => (
                <li key={link.name}>
                  {link.external ? (
                    <a href={link.href} target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-[#C9A96E] transition-colors text-sm block">
                      {link.name}
                    </a>
                  ) : (
                    <Link href={link.href} className="text-white/70 hover:text-[#C9A96E] transition-colors text-sm block">
                      {link.name}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* ستون پنجم: خبرنامه */}
          <div className="relative text-center hidden md:block">
            <h3 className="text-[#C9A96E] font-black text-base mb-2">خبرنامه</h3>
            <p className="text-white/60 text-sm mb-2">
              آخرین اخبار را در ایمیل خود دریافت کنید
            </p>
            <NewsletterForm />
          </div>
        </div>

        <div className="border-t border-white/10 pt-3 pb-1 flex flex-col md:flex-row justify-between items-center gap-2">
          <p className="text-white/50 text-sm">
            © {new Date().getFullYear()} {settings.footerCopyright || 'لیان دید. تمامی حقوق محفوظ است.'}
          </p>
          <a href="https://liandesign.ir" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-white/50 hover:text-[#C9A96E] transition-colors text-sm">
            <Image src="/liandesign.logo.png" alt="لیان دیزاین" width={40} height={40} className="rounded-sm" />
            <span>طراحی و تولید: <span className="font-bold">لیان دیزاین</span></span>
          </a>
        </div>
      </div>
    </footer>
  );
}
