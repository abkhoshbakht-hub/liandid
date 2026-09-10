import type { Metadata } from 'next';
import NewspapersClient from './client';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'صفحه اول روزنامه‌های امروز | لیان دید',
  description: 'مشاهده صفحه اول روزنامه‌های امروز ایران، بوشهر و ورزشی به همراه آرشیو شماره‌های گذشته.',
  alternates: { canonical: 'https://liandid.ir/newspapers' },
  openGraph: { title: 'صفحه اول روزنامه‌های امروز', description: 'جلد امروز روزنامه‌های سراسری، بوشهر و ورزشی', type: 'website', url: 'https://liandid.ir/newspapers' },
};

export default function NewspapersPage() {
  return <NewspapersClient />;
}
