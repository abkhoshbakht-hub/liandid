import type { Metadata } from 'next';
import ArchiveLoader from './loader';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'آرشیو صفحه اول روزنامه‌ها | لیان دید',
  description: 'آرشیو صفحه اول روزنامه‌ها بر اساس تاریخ و روزنامه.',
  alternates: { canonical: 'https://liandid.ir/newspapers/archive' },
};

export default function ArchivePage() {
  return (
    <main className="max-w-7xl mx-auto px-3 md:px-6 py-6" dir="rtl">
      <h1 className="text-2xl font-black text-[#1B365D] text-center mb-5">آرشیو صفحه اول روزنامه‌ها</h1>
      <ArchiveLoader />
    </main>
  );
}
