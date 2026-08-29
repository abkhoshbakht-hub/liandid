import SubmitForm from '@/components/submit/SubmitForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ارسال خبر',
  description: 'خبر یا گزارش خود را برای انتشار در پایگاه خبری لیان دید ارسال کنید',
  openGraph: { title: 'ارسال خبر | لیان دید', description: 'خبر یا گزارش خود را برای انتشار در لیان دید ارسال کنید', type: 'website', url: 'https://liandid.ir/submit', siteName: 'لیان دید', locale: 'fa_IR' },
  twitter: { card: 'summary_large_image', title: 'ارسال خبر | لیان دید', description: 'خبر یا گزارش خود را ارسال کنید' },
  alternates: { canonical: 'https://liandid.ir/submit' },
};

export default function SubmitPage() {
  return <SubmitForm />;
}