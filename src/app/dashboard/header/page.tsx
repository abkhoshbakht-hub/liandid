'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

export default function HeaderPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-[#C9A96E] border-t-transparent rounded-full" /></div>}>
      <HeaderContent />
    </Suspense>
  );
}

function HeaderContent() {
  const searchParams = useSearchParams();
  const section = searchParams.get('section');
  const [license, setLicense] = useState('9622');
  const [aboutText, setAboutText] = useState('درباره ما');
  const [aboutLink, setAboutLink] = useState('/about');
  const [contactText, setContactText] = useState('تماس با ما');
  const [contactLink, setContactLink] = useState('/contact');
  const [logoText, setLogoText] = useState('لیان دید');
  const [logoUrl, setLogoUrl] = useState('/logo.png');
  const [searchPlaceholder, setSearchPlaceholder] = useState('جستجو در اخبار...');
  const [navItems, setNavItems] = useState('صفحه اصلی,سیاسی,اقتصادی,اجتماعی,بین\u200cالملل,فناوری,ورزشی,فرهنگی,علمی,گالری,اخبار شهرها');
  const [ogImage, setOgImage] = useState('/og-image.png');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('/api/admin/settings').then(r => r.json()).then(data => {
      if (data.license) setLicense(data.license);
      if (data.aboutText) setAboutText(data.aboutText);
      if (data.aboutLink) setAboutLink(data.aboutLink);
      if (data.contactText) setContactText(data.contactText);
      if (data.contactLink) setContactLink(data.contactLink);
      if (data.logoText) setLogoText(data.logoText);
      if (data.logoUrl) setLogoUrl(data.logoUrl);
      if (data.searchPlaceholder) setSearchPlaceholder(data.searchPlaceholder);
      if (data.navItems) setNavItems(data.navItems);
      if (data.ogImage) setOgImage(data.ogImage);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (section) {
      setTimeout(() => {
        document.getElementById('section-' + section)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 200);
    }
  }, [section]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ license, aboutText, aboutLink, contactText, contactLink, logoText, logoUrl, searchPlaceholder, navItems, ogImage }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) { console.error(e); }
    setSaving(false);
  };

  const sectionClass = (key: string) => `bg-white rounded-2xl border p-6 mb-4 transition-all ${section === key ? 'border-[#C9A96E] shadow-lg shadow-[#C9A96E]/10' : 'border-gray-100'}`;

  return (
    <div className="max-w-3xl" dir="rtl">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-[#0a1628]">تنظیمات هدر سایت</h1>
        <p className="text-sm text-gray-400 mt-1">تنظیمات نوار ابزار و هدر اصلی سایت را از اینجا مدیریت کنید</p>
      </div>

      <div id="section-license" className={sectionClass('license')}>
        <h2 className="text-sm font-black text-[#1B365D] mb-4">پروانه انتشار</h2>
        <div>
          <label className="block text-xs text-gray-400 mb-1">شماره پروانه</label>
          <input type="text" value={license} onChange={e => setLicense(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#C9A96E]" />
        </div>
      </div>

      <div id="section-about" className={sectionClass('about')}>
        <h2 className="text-sm font-black text-[#1B365D] mb-4">درباره ما</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1">متن</label>
            <input type="text" value={aboutText} onChange={e => setAboutText(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#C9A96E]" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">لینک</label>
            <input type="text" value={aboutLink} onChange={e => setAboutLink(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#C9A96E]" dir="ltr" />
          </div>
        </div>
      </div>

      <div id="section-contact" className={sectionClass('contact')}>
        <h2 className="text-sm font-black text-[#1B365D] mb-4">تماس با ما</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1">متن</label>
            <input type="text" value={contactText} onChange={e => setContactText(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#C9A96E]" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">لینک</label>
            <input type="text" value={contactLink} onChange={e => setContactLink(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#C9A96E]" dir="ltr" />
          </div>
        </div>
      </div>

      <div id="section-logo" className={sectionClass('logo')}>
        <h2 className="text-sm font-black text-[#1B365D] mb-4">لوگو</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1">متن لوگو</label>
            <input type="text" value={logoText} onChange={e => setLogoText(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#C9A96E]" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">آدرس تصویر</label>
            <input type="text" value={logoUrl} onChange={e => setLogoUrl(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#C9A96E]" dir="ltr" />
          </div>
        </div>
      </div>

      <div id="section-search" className={sectionClass('search')}>
        <h2 className="text-sm font-black text-[#1B365D] mb-4">نوار جستجو</h2>
        <div>
          <label className="block text-xs text-gray-400 mb-1">متن جایگزین</label>
          <input type="text" value={searchPlaceholder} onChange={e => setSearchPlaceholder(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#C9A96E]" />
        </div>
      </div>

      <div id="section-nav" className={sectionClass('nav')}>
        <h2 className="text-sm font-black text-[#1B365D] mb-4">نوار منوی ناوبری</h2>
        <div>
          <label className="block text-xs text-gray-400 mb-1">آیتم\u200cها (با کاما جدا کنید)</label>
          <textarea value={navItems} onChange={e => setNavItems(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#C9A96E] h-24" />
        </div>
      </div>

      <div id="section-ogimage" className={sectionClass('ogimage')}>
        <h2 className="text-sm font-black text-[#1B365D] mb-2">عکس شبکه‌های اجتماعی (OG Image)</h2>
        <p className="text-xs text-gray-400 mb-4">تصویری که هنگام اشتراک‌گذاری لینک سایت در تلگرام، اینستاگرام و شبکه‌های اجتماعی نمایش داده می‌شود (ابعاد پیشنهادی: 1200×630)</p>
        <div className="flex items-start gap-6">
          <div className="w-[300px] h-[158px] rounded-xl overflow-hidden border border-gray-200 bg-gray-50 flex-shrink-0">
            {ogImage && <img src={ogImage} alt="OG Image" className="w-full h-full object-cover" />}
          </div>
          <div className="flex-1 space-y-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">آدرس تصویر</label>
              <input type="text" value={ogImage} onChange={e => setOgImage(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#C9A96E]" dir="ltr" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">یا آپلود تصویر جدید</label>
              <input type="file" accept="image/png,image/jpeg,image/jpg" onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const fd = new FormData();
                fd.append('file', file);
                try {
                  const r = await fetch('/api/admin/upload', { method: 'POST', body: fd });
                  const data = await r.json();
                  if (data.url) setOgImage(data.url);
                } catch (err) { console.error(err); }
              }} className="w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-[#1B365D] file:text-white file:hover:bg-[#0f2440] file:cursor-pointer file:transition-colors" />
            </div>
          </div>
        </div>
      </div>

      <button onClick={handleSave} disabled={saving} className="px-6 py-2.5 rounded-xl bg-[#1B365D] text-white text-sm font-bold hover:bg-[#0f2440] transition-colors disabled:opacity-50">
        {saving ? 'در حال ذخیره...' : saved ? 'ذخیره شد' : 'ذخیره تغییرات'}
      </button>
    </div>
  );
}
