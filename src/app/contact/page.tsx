import { Metadata } from 'next';
import ContactContent from '@/components/contact/ContactContent';

export const metadata: Metadata = {
  title: 'تماس با ما',
  description: 'ارتباط با پایگاه خبری تحلیلی لیان دید - تلفن، ایمیل و آدرس دفتر مرکزی',
  openGraph: { title: 'تماس با ما | لیان دید', description: 'ارتباط با پایگاه خبری تحلیلی لیان دید', type: 'website', url: 'https://liandid.ir/contact', siteName: 'لیان دید', locale: 'fa_IR' },
  twitter: { card: 'summary_large_image', title: 'تماس با ما | لیان دید', description: 'ارتباط با پایگاه خبری تحلیلی لیان دید' },
  alternates: { canonical: 'https://liandid.ir/contact' },
};

export default function ContactPage() {
  return <ContactContent />;
}
