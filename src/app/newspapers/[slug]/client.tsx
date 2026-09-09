'use client';
import { useState } from 'react';
import Link from 'next/link';
import CoverViewer, { type CoverItem } from '@/components/newspapers/CoverViewer';

export default function PaperPageClient({ paper, today, recent, todayDate }: { paper: any; today: any; recent: any[]; todayDate: string }) {
  const [vi, setVi] = useState<number | null>(null);
  const items: CoverItem[] = recent.map((r) => ({ id: r.id, imageUrl: r.imageUrl, paperName: paper.name, persianDate: r.persianDate, issueNumber: r.issueNumber }));

  return (
    <div>
      <nav className="text-xs text-gray-400 mb-3"><Link href="/" className="hover:text-[#1B365D]">خانه</Link> / <Link href="/newspapers" className="hover:text-[#1B365D]">روزنامه‌ها</Link> / {paper.name}</nav>
      <h1 className="text-2xl font-black text-[#1B365D]">روزنامه {paper.name}</h1>
      {paper.description && <p className="text-gray-500 text-sm mt-1 text-justify">{paper.description}</p>}
      {paper.website && <a href={paper.website} target="_blank" rel="noopener" className="text-xs text-blue-600 mt-1 inline-block" dir="ltr">{paper.website}</a>}

      <h2 className="font-extrabold mt-6 mb-3">صفحه اول امروز <span className="text-gray-400 text-sm font-normal">({todayDate})</span></h2>
      {today ? (
        <button onClick={() => { const i = items.findIndex((x) => x.id === today.id); setVi(i >= 0 ? i : 0); }} className="block max-w-md cursor-zoom-in">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={today.imageUrl} alt={`صفحه اول روزنامه ${paper.name}`} className="w-full rounded-2xl shadow-lg border border-gray-100" />
        </button>
      ) : (
        <p className="text-gray-400 text-sm bg-gray-50 rounded-xl p-4">جلد امروز هنوز ثبت نشده است.</p>
      )}

      <h2 className="font-extrabold mt-8 mb-3">آرشیو {paper.name}</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {recent.map((r, idx) => (
          <button key={r.id} onClick={() => setVi(idx)} className="bg-white rounded-xl shadow overflow-hidden border border-gray-100 cursor-zoom-in">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={r.thumbnailUrl || r.imageUrl} alt={`${paper.name} ${r.persianDate}`} className="w-full aspect-[3/4] object-cover object-top" loading="lazy" />
            <div className="p-1.5 text-[11px] text-gray-500">{r.persianDate}</div>
          </button>
        ))}
      </div>
      {vi !== null && <CoverViewer items={items} index={vi} onClose={() => setVi(null)} onIndex={setVi} />}
    </div>
  );
}
