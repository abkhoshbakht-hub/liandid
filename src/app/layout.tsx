import type { Metadata } from 'next';
import { Vazirmatn } from 'next/font/google';
import AuthProvider from '@/providers/AuthProvider';
import { prisma } from '@/lib/prisma';
import './globals.css';

const vazir = Vazirmatn({
  subsets: ['arabic'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-vazir',
  display: 'swap',
});

async function getOgImage(): Promise<string> {
  try {
    const setting = await prisma.siteSetting.findUnique({ where: { key: 'ogImage' } });
    return setting?.value || '/og-image.png';
  } catch {
    return '/og-image.png';
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const ogImage = await getOgImage();

  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://liandid.ir'),
    title: {
      default: 'لیان دید | پایگاه خبری تحلیلی استان بوشهر',
      template: '%s | لیان دید',
    },
    description: 'پایگاه خبری تحلیلی لیان دید - اخبار لحظه‌ای استان بوشهر و ایران با پروانه انتشار ۹۶۲۲',
    keywords: ['خبر', 'تحلیل', 'بوشهر', 'ایران', 'اخبار سیاسی', 'اخبار اقتصادی'],
    authors: [{ name: 'لیان دید' }],
    creator: 'لیان دید',
    openGraph: {
      type: 'website',
      locale: 'fa_IR',
      url: 'https://liandid.ir',
      siteName: 'لیان دید',
      title: 'لیان دید | پایگاه خبری تحلیلی استان بوشهر',
      description: 'اخبار لحظه‌ای استان بوشهر و ایران',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: 'لیان دید',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'لیان دید',
      description: 'پایگاه خبری تحلیلی استان بوشهر',
      images: [ogImage],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl" className={vazir.variable}>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#1B365D" />
        <link rel="alternate" type="application/rss+xml" title="لیان دید | اخبار" href="/api/rss/feed" />
        <link rel="alternate" type="application/rss+xml" title="لیان دید | اخبار سیاسی" href="/api/rss/category/siasi" />
        <link rel="alternate" type="application/rss+xml" title="لیان دید | اخبار اقتصادی" href="/api/rss/category/eghtesadi" />
        <link rel="alternate" type="application/rss+xml" title="لیان دید | اخبار اجتماعی" href="/api/rss/category/egtemaee" />
        <link rel="alternate" type="application/rss+xml" title="لیان دید | اخبار بین‌الملل" href="/api/rss/category/bainolmelal" />
        <link rel="alternate" type="application/rss+xml" title="لیان دید | اخبار ورزشی" href="/api/rss/category/varzeshi" />
      </head>
      <body className={`${vazir.className} antialiased`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}