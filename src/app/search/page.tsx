import { Metadata } from 'next';
import { Suspense } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SearchContent from '@/components/search/SearchContent';

export const metadata: Metadata = {
  title: 'جستجو در اخبار',
  description: 'جستجوی اخبار در پایگاه خبری تحلیلی لیان دید',
  robots: { index: false, follow: false },
};

export default function SearchPage() {
  return (
    <>
      <Header />
      <Suspense fallback={
        <div className="bg-gray-50 min-h-screen flex items-center justify-center">
          <div className="inline-block w-10 h-10 border-4 border-[#C9A96E] border-t-transparent rounded-full animate-spin" />
        </div>
      }>
        <SearchContent />
      </Suspense>
      <Footer />
    </>
  );
}
