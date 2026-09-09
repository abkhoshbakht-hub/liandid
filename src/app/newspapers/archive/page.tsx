import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import ArchiveClient from './client';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'آرشیو صفحه اول روزنامه‌ها | لیان دید',
  description: 'آرشیو صفحه اول روزنامه‌ها بر اساس تاریخ و روزنامه.',
  alternates: { canonical: 'https://liandid.ir/newspapers/archive' },
};

export default async function ArchivePage() {
  let papers: any[] = [];
  let dates: string[] = [];
  try {
    papers = await prisma.newspaper.findMany({ where: { active: true }, orderBy: { displayOrder: 'asc' }, select: { id: true, name: true, slug: true, category: true } });
    const ds = await prisma.newspaperIssue.findMany({ where: { status: 'PUBLISHED' }, select: { date: true }, distinct: ['date'], orderBy: { date: 'desc' }, take: 60 });
    dates = ds.map((d) => d.date.toISOString().slice(0, 10));
  } catch {}
  return (
    <main className="max-w-7xl mx-auto px-3 md:px-6 py-6" dir="rtl">
      <h1 className="text-2xl font-black text-[#1B365D] text-center mb-5">آرشیو صفحه اول روزنامه‌ها</h1>
      <ArchiveClient papers={papers} dates={dates} />
    </main>
  );
}
