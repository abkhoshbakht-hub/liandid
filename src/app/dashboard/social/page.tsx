'use client';

import { useState, useEffect } from 'react';

export default function SocialPage() {
  const [telegram, setTelegram] = useState('https://t.me/liandid');
  const [instagram, setInstagram] = useState('https://instagram.com/liandid');
  const [rubika, setRubika] = useState('https://rubika.ir/liandid');
  const [bale, setBale] = useState('https://bale.ai/liandid');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('/api/admin/settings').then(r => r.json()).then(data => {
      if (data.telegram) setTelegram(data.telegram);
      if (data.instagram) setInstagram(data.instagram);
      if (data.rubika) setRubika(data.rubika);
      if (data.bale) setBale(data.bale);
    }).catch(() => {});
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telegram, instagram, rubika, bale }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      console.error(e);
    }
    setSaving(false);
  };

  const platforms = [
    { name: 'تلگرام', value: telegram, setter: setTelegram, color: '#0088cc', icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z' },
    { name: 'اینستاگرام', value: instagram, setter: setInstagram, color: '#e4405f', icon: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z' },
    { name: 'روبیکا', value: rubika, setter: setRubika, color: '#ff6600', icon: '' },
    { name: 'بله', value: bale, setter: setBale, color: '#2563eb', icon: '' },
  ];

  return (
    <div className="max-w-3xl" dir="rtl">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-[#0a1628]">شبکه‌های اجتماعی</h1>
        <p className="text-sm text-gray-400 mt-1">لینک شبکه‌های اجتماعی سایت را مدیریت کنید</p>
      </div>

      <div className="space-y-4">
        {platforms.map(p => (
          <div key={p.name} className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${p.color}20` }}>
                {p.icon ? (
                  <svg className="w-5 h-5" fill={p.color} viewBox="0 0 24 24"><path d={p.icon}/></svg>
                ) : (
                  <div className="w-5 h-5 rounded-full" style={{ background: p.color }} />
                )}
              </div>
              <div>
                <h2 className="text-sm font-black" style={{ color: p.color }}>{p.name}</h2>
                <p className="text-[11px] text-gray-400">لینک صفحه {p.name}</p>
              </div>
            </div>
            <input
              type="url"
              value={p.value}
              onChange={e => p.setter(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#C9A96E]"
              dir="ltr"
              placeholder={`https://${p.name}.com/...`}
            />
          </div>
        ))}
      </div>

      <div className="mt-6">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 rounded-xl bg-[#1B365D] text-white text-sm font-bold hover:bg-[#0f2440] transition-colors disabled:opacity-50"
        >
          {saving ? 'در حال ذخیره...' : saved ? 'ذخیره شد ✓' : 'ذخیره تغییرات'}
        </button>
      </div>
    </div>
  );
}
