import type { Metadata } from 'next';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { tehranToday, toFaDigits } from '@/lib/newspapers/date';
import Board from '@/components/newspapers/Board';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'صفحه اول روزنامه‌های امروز | لیان دید',
  description: 'مشاهده صفحه اول روزنامه‌های امروز ایران، بوشهر و ورزشی به همراه آرشیو شماره‌های گذشته.',
  alternates: { canonical: 'https://liandid.ir/newspapers' },
  openGraph: { title: 'صفحه اول روزنامه‌های امروز', description: 'جلد امروز روزنامه‌های سراسری، بوشهر و ورزشی', type: 'website', url: 'https://liandid.ir/newspapers' },
};

export default async function NewspapersPage() {
  const day = tehranToday();
  let papers: any[] = [];
  let todayMap: Record<string, any> = {};
  try {
    papers = await prisma.newspaper.findMany({ where: { active: true }, orderBy: { displayOrder: 'asc' } });
    const today = await prisma.newspaperIssue.findMany({
      where: { status: 'PUBLISHED', newspaper: { active: true } },
      select: { newspaperId: true, imageUrl: true, thumbnailUrl: true, persianDate: true, issueNumber: true, date: true },
      orderBy: { createdAt: 'desc' },
    });
    const seen = new Set<string>();
    for (const t of today) {
      if (!seen.has(t.newspaperId)) {
        todayMap[t.newspaperId] = t;
        seen.add(t.newspaperId);
      }
    }
  } catch (e: any) {
    console.error('Newspapers page error:', e?.message || e);
  }

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
        <p className="text-gray-500 mt-1 text-sm">{toFaDigits(day.persian.replaceAll('/', ' / '))}</p>
        <Link href="/newspapers/archive" className="inline-block mt-3 text-sm font-bold text-[#1B365D] border border-[#1B365D] rounded-full px-5 py-1.5 hover:bg-[#1B365D] hover:text-white transition-colors">مشاهده آرشیو</Link>
      </div>
      <Board papers={papers.map((p) => ({ id: p.id, name: p.name, slug: p.slug, category: p.category, today: todayMap[p.id] || null }))} date={day.persian} />
    </main>
  );
}
