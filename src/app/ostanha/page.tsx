import { Metadata } from 'next';
import OstanhaContent from '@/components/ostanha/OstanhaContent';

export const metadata: Metadata = {
  title: 'اخبار استانها',
  description: 'آخرین اخبار سراسر کشور از استان بوشهر تا تهران - پایگاه خبری لیان دید',
  openGraph: { title: 'اخبار استانها | لیان دید', description: 'آخرین اخبار سراسر کشور', type: 'website', url: 'https://liandid.ir/ostanha', siteName: 'لیان دید', locale: 'fa_IR' },
  twitter: { card: 'summary_large_image', title: 'اخبار استانها | لیان دید', description: 'آخرین اخبار سراسر کشور' },
  alternates: { canonical: 'https://liandid.ir/ostanha' },
};

export default function OstanhaPage() {
  return <OstanhaContent />;
}
