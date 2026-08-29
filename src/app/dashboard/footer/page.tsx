'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface FooterLink {
  name: string;
  href: string;
  external?: boolean;
}

const defaultLinks: FooterLink[] = [
  { name: 'درباره ما', href: '/about' },
  { name: 'تماس با ما', href: '/contact' },
  { name: 'حریم خصوصی', href: '/privacy' },
  { name: 'قوانین', href: '/terms' },
  { name: 'فید RSS', href: '/api/rss/feed', external: true },
];

export default function FooterSettingsPage() {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const router = useRouter();
  const [tagline, setTagline] = useState('پایگاه خبری تحلیلی لیان دید');
  const [subtagline, setSubtagline] = useState('اخبار لحظه\u200cای استان بوشهر و ایران');
  const [address, setAddress] = useState('بوشهر، امامزاده مهر ۱۸');
  const [phone, setPhone] = useState('۰۹۳۶-۰۲۸-۰۵۶۲');
  const [copyright, setCopyright] = useState('لیان دید. تمامی حقوق محفوظ است.');
  const [creditText, setCreditText] = useState('طراحی و تولید: لیان دیزاین');
  const [creditLink, setCreditLink] = useState('https://liandesign.ir');
  const [links, setLinks] = useState<FooterLink[]>(defaultLinks);
  const [newLinkName, setNewLinkName] = useState('');
  const [newLinkHref, setNewLinkHref] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isAdmin)) router.push('/secure-a2x-admin');
  }, [isAuthenticated, isAdmin, isLoading, router]);

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      fetch('/api/admin/settings').then(r => r.json()).then(data => {
        if (data.footerDescription) setTagline(data.footerDescription);
        if (data.footerAddress) setAddress(data.footerAddress);
        if (data.footerPhone) setPhone(data.footerPhone);
        if (data.footerCopyright) setCopyright(data.footerCopyright);
        if (data.footerCreditText) setCreditText(data.footerCreditText);
        if (data.footerCreditLink) setCreditLink(data.footerCreditLink);
        if (data.footerLinks) {
          try { setLinks(JSON.parse(data.footerLinks)); } catch {}
        }
      }).catch(() => {});
    }
  }, [isAuthenticated, isAdmin]);

  if (isLoading || !isAuthenticated || !isAdmin) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-[#C9A96E] border-t-transparent rounded-full" /></div>;
  }

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          footerDescription: tagline,
          footerAddress: address,
          footerPhone: phone,
          footerCopyright: copyright,
          footerCreditText: creditText,
          footerCreditLink: creditLink,
          footerLinks: JSON.stringify(links),
        }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) { console.error(e); }
    setSaving(false);
  };

  const addLink = () => {
    if (!newLinkName || !newLinkHref) return;
    setLinks([...links, { name: newLinkName, href: newLinkHref, external: newLinkHref.startsWith('http') }]);
    setNewLinkName('');
    setNewLinkHref('');
  };

  const removeLink = (idx: number) => {
    setLinks(links.filter((_, i) => i !== idx));
  };

  const moveLink = (idx: number, dir: number) => {
    const newArr = [...links];
    const swap = idx + dir;
    if (swap < 0 || swap >= newArr.length) return;
    [newArr[idx], newArr[swap]] = [newArr[swap], newArr[idx]];
    setLinks(newArr);
  };

  return (
    <div className="max-w-3xl" dir="rtl">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-[#0a1628]">تنظیمات فوتر</h1>
        <p className="text-sm text-gray-400 mt-1">محتوای فوتر سایت را از اینجا مدیریت کنید</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-4">
        <h2 className="text-sm font-black text-[#1B365D] mb-4">لوگو و توضیحات</h2>
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-400 mb-1">توضیحات فوتر</label>
            <textarea value={tagline} onChange={e => setTagline(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#C9A96E] h-20" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">آدرس</label>
              <input type="text" value={address} onChange={e => setAddress(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#C9A96E]" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">تلفن</label>
              <input type="text" value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#C9A96E]" dir="ltr" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-4">
        <h2 className="text-sm font-black text-[#1B365D] mb-4">لینک\u200cهای مفید</h2>
        <div className="space-y-2 mb-4">
          {links.map((link, idx) => (
            <div key={idx} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
              <span className="text-xs text-gray-400 w-5">{idx + 1}</span>
              <span className="flex-1 text-sm font-bold text-gray-700">{link.name}</span>
              <span className="text-xs text-gray-400" dir="ltr">{link.href}</span>
              <button onClick={() => moveLink(idx, -1)} className="text-gray-400 hover:text-gray-600 px-1">▲</button>
              <button onClick={() => moveLink(idx, 1)} className="text-gray-400 hover:text-gray-600 px-1">▼</button>
              <button onClick={() => removeLink(idx)} className="text-red-400 hover:text-red-600 text-xs font-bold">حذف</button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input type="text" value={newLinkName} onChange={e => setNewLinkName(e.target.value)} placeholder="نام لینک" className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#C9A96E]" />
          <input type="text" value={newLinkHref} onChange={e => setNewLinkHref(e.target.value)} placeholder="/about" className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#C9A96E]" dir="ltr" />
          <button onClick={addLink} className="px-4 py-2 bg-[#1B365D] text-white text-sm font-bold rounded-lg hover:bg-[#2a4a7a] transition-colors">افزودن</button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-4">
        <h2 className="text-sm font-black text-[#1B365D] mb-4">بنر ارسال خبر</h2>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">عنوان بنر</label>
              <input type="text" defaultValue="ارسال خبر" id="bannerTitle" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#C9A96E]" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">لینک دکمه</label>
              <input type="text" defaultValue="/submit" id="bannerLink" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#C9A96E]" dir="ltr" />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">توضیحات بنر</label>
            <input type="text" defaultValue="خبرها و تصاویر خود را از سراسر نقاط استان برای ما ارسال نمایید" id="bannerDesc" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#C9A96E]" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-4">
        <h2 className="text-sm font-black text-[#1B365D] mb-4">کپی\u200cرایت و طراحی</h2>
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-400 mb-1">متن کپی\u200cرایت</label>
            <input type="text" value={copyright} onChange={e => setCopyright(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#C9A96E]" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">متن طراحی</label>
            <input type="text" value={creditText} onChange={e => setCreditText(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#C9A96E]" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">لینک طراح</label>
            <input type="url" value={creditLink} onChange={e => setCreditLink(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#C9A96E]" dir="ltr" />
          </div>
        </div>
      </div>

      <button onClick={handleSave} disabled={saving} className="px-6 py-2.5 rounded-xl bg-[#1B365D] text-white text-sm font-bold hover:bg-[#0f2440] transition-colors disabled:opacity-50">
        {saving ? 'در حال ذخیره...' : saved ? 'ذخیره شد' : 'ذخیره تغییرات'}
      </button>
    </div>
  );
}
