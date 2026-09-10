'use client';
import { useEffect, useState } from 'react';
import ArchiveClient from './client';

export default function ArchiveLoader() {
  const [papers, setPapers] = useState<any[]>([]);
  const [dates, setDates] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/newspapers?today=1')
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setPapers((d.data.papers || []).map((p: any) => ({ id: p.id, name: p.name, slug: p.slug, category: p.category })));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-center text-gray-400 py-10">در حال بارگذاری...</p>;
  return <ArchiveClient papers={papers} dates={dates} />;
}
