'use client';

import { useState, useEffect } from 'react';

export default function SubmitBanner() {
  const [settings, setSettings] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch('/api/admin/settings').then(r => r.json()).then(setSettings).catch(() => {});
  }, []);

  const showBanner = settings.submitBannerShow !== 'false';
  const title = settings.submitBannerTitle || 'ارسال خبر';
  const desc = settings.submitBannerDesc || 'خبرها و تصاویر خود را از سراسر نقاط استان برای ما ارسال نمایید';
  const link = settings.submitBannerLink || '/submit';

  if (!showBanner) return null;

  return (
    <div className="mt-12 bg-[#0a1628] rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-right">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-white/10 rounded-xl items-center justify-center flex-shrink-0 hidden sm:flex">
          <svg className="w-6 h-6 text-[#C9A96E]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </div>
        <div>
          <h3 className="text-white font-bold text-lg">{title}</h3>
          <p className="text-white/50 text-sm">{desc}</p>
        </div>
      </div>
      <a
        href={link}
        className="flex items-center justify-center gap-2 bg-[#C9A96E] text-[#0a1628] px-6 py-3 rounded-lg font-bold text-sm hover:bg-[#d4b87a] transition-all flex-shrink-0 shadow-lg shadow-amber-900/20 w-full sm:w-auto"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        {title}
      </a>
    </div>
  );
}
