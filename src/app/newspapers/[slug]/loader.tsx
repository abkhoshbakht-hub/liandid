'use client';
import { useEffect, useState } from 'react';
import { notFound } from 'next/navigation';
import PaperPageClient from './client';

export default function PaperLoader({ slug }: { slug: string }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/newspapers/${slug}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setData(d.data);
        else setData({ error: true });
      })
      .catch(() => setData({ error: true }))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <main className="max-w-6xl mx-auto px-3 md:px-6 py-6 text-center text-gray-400">در حال بارگذاری...</main>;
  if (!data || data.error) return notFound();

  const jsonLd: any = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: `صفحه اول روزنامه ${data.paper.name}`,
    image: data.today ? [data.today.imageUrl] : undefined,
    datePublished: data.today ? data.today.date : undefined,
  };

  return (
    <main className="max-w-6xl mx-auto px-3 md:px-6 py-6" dir="rtl">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <PaperPageClient paper={data.paper} today={data.today} recent={data.recent} todayDate={data.todayDate} />
    </main>
  );
}
