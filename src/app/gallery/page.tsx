import { Metadata } from 'next';
import GalleryContent from '@/components/gallery/GalleryContent';

export const metadata: Metadata = {
  title: 'گالری عکس',
  description: 'گالری تصاویر رویدادها و اخبار استان بوشهر - پایگاه خبری لیان دید',
  openGraph: { title: 'گالری عکس | لیان دید', description: 'گالری تصاویر رویدادها و اخبار استان بوشهر', type: 'website', url: 'https://liandid.ir/gallery', siteName: 'لیان دید', locale: 'fa_IR' },
  twitter: { card: 'summary_large_image', title: 'گالری عکس | لیان دید', description: 'گالری تصاویر رویدادها و اخبار استان بوشهر' },
  alternates: { canonical: 'https://liandid.ir/gallery' },
};

export default function GalleryPage() {
  return <GalleryContent />;
}
