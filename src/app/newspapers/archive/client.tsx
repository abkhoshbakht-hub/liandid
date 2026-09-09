'use client';
import { useEffect, useState } from 'react';
import CoverViewer, { type CoverItem } from '@/components/newspapers/CoverViewer';

export default function ArchiveClient({ papers, dates }: { papers: any[]; dates: string[] }) {
  const [f, setF] = useState({ date: '', paper: '', category: '' });
  const [items, setItems] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [vi, setVi] = useState<number | null>(null);

  async function load(p = 1) {
    setLoading(true);
    const q = new URLSearchParams({ page: String(p) });
    if (f.date) q.set('date', f.date);
    if (f.paper) q.set('paper', f.paper);
    if (f.category) q.set('category', f.category);
    try {
      const r = await fetch(`/api/newspapers/archive?${q}`);
      const d = await r.json();
      if (d.success) { setItems(d.data.items); setPages(d.data.pages); setPage(d.data.page); }
    } catch {}
    setLoading(false);
  }
  useEffect(() => { load(1); }, []);

  const viewItems: CoverItem[] = items.map((it) => ({ id: it.id, imageUrl: it.imageUrl, paperName: it.newspaper.name, persianDate: it.persianDate, issueNumber: it.issueNumber }));

  return (
    <div>
      <div className="bg-white rounded-2xl shadow p-3 flex flex-wrap gap-2 items-end mb-5 text-sm">
        <label className="flex flex-col gap-1">تاریخ
          <select value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} className="border rounded-lg px-2 py-1.5">
            <option value="">همه روزها</option>
            {dates.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-1">روزنامه
          <select value={f.paper} onChange={(e) => setF({ ...f, paper: e.target.value })} className="border rounded-lg px-2 py-1.5">
            <option value="">همه</option>
            {papers.map((p) => <option key={p.id} value={p.slug}>{p.name}</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-1">دسته
          <select value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })} className="border rounded-lg px-2 py-1.5">
            <option value="">همه</option><option value="national">سراسری</option><option value="bushehr">بوشهر</option><option value="sports">ورزشی</option>
          </select>
        </label>
        <button onClick={() => load(1)} className="bg-[#1B365D] text-white px-5 py-1.5 rounded-lg font-bold">جستجو</button>
      </div>
      {loading ? <p className="text-center text-gray-400 py-8">در حال جستجو...</p> : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {items.map((it, idx) => (
              <button key={it.id} onClick={() => setVi(idx)} className="bg-white rounded-xl shadow overflow-hidden border border-gray-100 cursor-zoom-in text-right">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={it.thumbnailUrl || it.imageUrl} alt={`${it.newspaper.name} ${it.persianDate}`} className="w-full aspect-[3/4] object-cover object-top" loading="lazy" />
                <div className="p-1.5 text-[11px]"><b>{it.newspaper.name}</b><div className="text-gray-400">{it.persianDate}</div></div>
              </button>
            ))}
          </div>
          {items.length === 0 && <p className="text-center text-gray-400 py-10">موردی یافت نشد.</p>}
          {pages > 1 && (
            <div className="flex gap-2 justify-center mt-5 text-sm">
              <button disabled={page <= 1} onClick={() => load(page - 1)} className="px-3 py-1 bg-gray-100 rounded-lg disabled:opacity-40">قبلی</button>
              <span className="px-2 py-1">{page} / {pages}</span>
              <button disabled={page >= pages} onClick={() => load(page + 1)} className="px-3 py-1 bg-gray-100 rounded-lg disabled:opacity-40">بعدی</button>
            </div>
          )}
        </>
      )}
      {vi !== null && <CoverViewer items={viewItems} index={vi} onClose={() => setVi(null)} onIndex={setVi} />}
    </div>
  );
}
