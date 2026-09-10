'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface StripPaper {
  id: string;
  name: string;
  slug: string;
  today: { imageUrl: string; thumbnailUrl: string | null; persianDate: string } | null;
}

export default function NewspapersStrip() {
  const [papers, setPapers] = useState<StripPaper[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch('/api/newspapers')
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setPapers((d.data.papers || []).filter((p: StripPaper) => p.today));
        }
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  if (!loaded || papers.length === 0) return null;

  return (
    <section className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-5" dir="rtl">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg md:text-xl font-black text-[#1B365D]">صفحه اول روزنامه‌های امروز</h2>
        <Link href="/newspapers" className="text-xs md:text-sm font-bold text-[#1B365D] border border-[#1B365D] rounded-full px-4 py-1.5 hover:bg-[#1B365D] hover:text-white transition-colors">مشاهده همه</Link>
      </div>
      <div className="flex gap-3 md:gap-4 overflow-x-auto pb-2">
        {papers.map((p) => (
          <Link key={p.id} href={`/newspapers/${p.slug}`} className="shrink-0 w-28 md:w-36 group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={p.today!.thumbnailUrl || p.today!.imageUrl}
              alt={`صفحه اول روزنامه ${p.name}`}
              className="w-full aspect-[3/4] object-cover object-top rounded-xl border border-gray-100 shadow-sm group-hover:shadow-md transition-shadow"
              loading="lazy"
            />
            <div className="text-center text-xs md:text-sm font-bold text-[#1B365D] mt-1.5">{p.name}</div>
          </Link>
        ))}
      </div>
    </section>
  );
}
