import { Metadata } from 'next';
import VideosContent from '@/components/gallery/VideosContent';

export const metadata: Metadata = {
  title: 'گالری فیلم',
  description: 'گالری فیلم و ویدیوهای رویدادها و اخبار استان بوشهر - پایگاه خبری لیان دید',
  openGraph: { title: 'گالری فیلم | لیان دید', description: 'گالری فیلم و ویدیوهای رویدادها و اخبار استان بوشهر', type: 'website', url: 'https://liandid.ir/gallery/videos', siteName: 'لیان دید', locale: 'fa_IR' },
  twitter: { card: 'summary_large_image', title: 'گالری فیلم | لیان دید', description: 'گالری فیلم و ویدیوهای رویدادها و اخبار استان بوشهر' },
  alternates: { canonical: 'https://liandid.ir/gallery/videos' },
};

export default function VideosPage() {
  return <VideosContent />;
}
