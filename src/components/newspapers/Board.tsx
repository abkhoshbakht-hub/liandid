'use client';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import CoverViewer, { type CoverItem } from './CoverViewer';

export interface BoardPaper {
  id: string;
  name: string;
  slug: string;
  category: string;
  today: { imageUrl: string; thumbnailUrl: string | null; persianDate: string; issueNumber: string | null } | null;
}

const TABS = [
  { id: 'all', label: 'همه' },
  { id: 'national', label: 'سراسری' },
  { id: 'bushehr', label: 'بوشهر' },
  { id: 'sports', label: 'ورزشی' },
];

export default function Board({ papers, date }: { papers: BoardPaper[]; date: string }) {
  const [tab, setTab] = useState('all');
  const [vi, setVi] = useState<number | null>(null);

  const filtered = useMemo(() => (tab === 'all' ? papers : papers.filter((p) => p.category === tab)), [papers, tab]);
  const viewItems: CoverItem[] = useMemo(
    () => filtered.filter((p) => p.today).map((p) => ({ id: p.id, imageUrl: p.today!.imageUrl, paperName: p.name, persianDate: p.today!.persianDate, issueNumber: p.today!.issueNumber, slug: p.slug })),
    [filtered]
  );

  return (
    <div>
      <div className="flex gap-2 justify-center mb-6 flex-wrap">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`px-5 py-2 rounded-full text-sm font-bold transition-colors ${tab === t.id ? 'bg-[#1B365D] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{t.label}</button>
        ))}
      </div>
      {filtered.length === 0 && <p className="text-center text-gray-400 py-10">هنوز جلدی ثبت نشده است.</p>}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
        {filtered.map((p) => {
          const vIdx = viewItems.findIndex((v) => v.id === p.id);
          return (
            <div key={p.id} className="bg-white rounded-2xl shadow hover:shadow-lg transition-shadow overflow-hidden border border-gray-100">
              {p.today ? (
                <button className="block w-full cursor-zoom-in" onClick={() => vIdx >= 0 && setVi(vIdx)}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.today.thumbnailUrl || p.today.imageUrl} alt={`صفحه اول روزنامه ${p.name}`} className="w-full aspect-[3/4] object-cover object-top" loading="lazy" />
                </button>
              ) : (
                <div className="w-full aspect-[3/4] bg-gray-50 flex flex-col items-center justify-center text-gray-300 gap-1">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9" /></svg>
                  <span className="text-xs">جلد امروز ثبت نشده</span>
                </div>
              )}
              <div className="p-3">
                <div className="font-extrabold text-[#1B365D] text-sm md:text-base">{p.name}</div>
                <div className="text-[11px] text-gray-400 mt-0.5">{p.today ? p.today.persianDate : date}</div>
                <div className="flex gap-2 mt-2">
                  {p.today && <button onClick={() => vIdx >= 0 && setVi(vIdx)} className="flex-1 bg-[#1B365D] text-white text-xs font-bold rounded-lg py-1.5">مشاهده</button>}
                  <Link href={`/newspapers/${p.slug}`} className="flex-1 text-center border border-[#1B365D] text-[#1B365D] text-xs font-bold rounded-lg py-1.5">آرشیو</Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {vi !== null && <CoverViewer items={viewItems} index={Math.min(vi, viewItems.length - 1)} onClose={() => setVi(null)} onIndex={setVi} />}
    </div>
  );
}
