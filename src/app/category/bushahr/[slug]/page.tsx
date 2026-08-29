'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const shahrestanNames: Record<string, string> = {
  booshehr: 'بوشهر', dayer: 'دیر', deylam: 'دیلم', genaveh: 'گناوه',
  dashtestan: 'دشتستان', dashti: 'دشتی', tangestan: 'تنگستان',
  kangan: 'کنگان', asaluyeh: 'عسلویه', jam: 'جم', kharg: 'جزیره خارگ',
};

export default function ShahrestanPage() {
  const params = useParams();
  const slug = params.slug as string;
  const name = shahrestanNames[slug] || slug;

  return (
    <>
      <Header />
      <main className="bg-gray-50 min-h-screen">
        <div className="site-container py-10">
          <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
            <Link href="/" className="hover:text-[#1B365D]">صفحه اصلی</Link>
            <span>/</span>
            <Link href="/category/bushahr" className="hover:text-[#1B365D]">بوشهر</Link>
            <span>/</span>
            <span className="text-[#1B365D] font-bold">{name}</span>
          </nav>

          <div className="bg-gradient-to-l from-sky-500 to-blue-600 rounded-2xl p-8 mb-8 text-white relative overflow-hidden">
            <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2" />
            <div className="relative z-10">
              <h1 className="text-3xl font-black">{name}</h1>
              <p className="text-white/80 text-sm mt-2">اخبار شهرستان {name}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-8 text-center border border-gray-100">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-gray-700 mb-2">اخبار {name}</h2>
            <p className="text-gray-400 text-sm">اخبار این بخش به زودی فعال می‌شود</p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}