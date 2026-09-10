'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Board, { type BoardPaper } from '@/components/newspapers/Board';

function toFaDigits(s: string | number): string {
  return String(s).replace(/[0-9]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[+d]);
}

export default function NewspapersClient() {
  const [papers, setPapers] = useState<BoardPaper[]>([]);
  const [date, setDate] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/newspapers?today=1')
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setPapers(d.data.papers || []);
          setDate(d.data.date || '');
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'خانه', item: 'https://liandid.ir' },
      { '@type': 'ListItem', position: 2, name: 'صفحه اول روزنامه‌ها', item: 'https://liandid.ir/newspapers' },
    ],
  };

  return (
    <main className="max-w-7xl mx-auto px-3 md:px-6 py-6" dir="rtl">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <div className="text-center mb-6">
        <h1 className="text-2xl md:text-3xl font-black text-[#1B365D]">صفحه اول روزنامه‌های امروز</h1>
        <p className="text-gray-500 mt-1 text-sm">{date ? toFaDigits(date.replaceAll('/', ' / ')) : '...'}</p>
        <Link href="/newspapers/archive" className="inline-block mt-3 text-sm font-bold text-[#1B365D] border border-[#1B365D] rounded-full px-5 py-1.5 hover:bg-[#1B365D] hover:text-white transition-colors">مشاهده آرشیو</Link>
      </div>
      {loading ? <p className="text-center text-gray-400 py-10">در حال بارگذاری...</p> : <Board papers={papers} date={date} />}
    </main>
  );
}
