'use client';

import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const provinces = [
  { id: 1, name: 'بوشهر', slug: 'bushehr', newsCount: 156, isLocal: true, color: 'from-sky-500 to-blue-600', icon: '🌊' },
  { id: 2, name: 'تهران', slug: 'tehran', newsCount: 89, isLocal: false, color: 'from-gray-600 to-gray-800', icon: '🏙️' },
  { id: 3, name: 'اصفهان', slug: 'isfahan', newsCount: 67, isLocal: false, color: 'from-amber-500 to-orange-600', icon: '🕌' },
  { id: 4, name: 'فارس', slug: 'fars', newsCount: 54, isLocal: false, color: 'from-rose-500 to-pink-600', icon: '🌸' },
  { id: 5, name: 'خوزستان', slug: 'khuzestan', newsCount: 48, isLocal: false, color: 'from-green-600 to-emerald-700', icon: '🛢️' },
  { id: 6, name: 'مازندران', slug: 'mazandaran', newsCount: 42, isLocal: false, color: 'from-emerald-500 to-teal-600', icon: '🌿' },
  { id: 7, name: 'گیلان', slug: 'gilan', newsCount: 38, isLocal: false, color: 'from-teal-500 to-cyan-600', icon: '🍵' },
  { id: 8, name: 'آذربایجان شرقی', slug: 'azbayjan-sharqi', newsCount: 35, isLocal: false, color: 'from-blue-500 to-indigo-600', icon: '🏔️' },
  { id: 9, name: 'کرمان', slug: 'kerman', newsCount: 31, isLocal: false, color: 'from-amber-600 to-yellow-600', icon: '☀️' },
  { id: 10, name: 'سیستان و بلوچستان', slug: 'sistan-baluchestan', newsCount: 28, isLocal: false, color: 'from-orange-500 to-red-500', icon: '🏜️' },
  { id: 11, name: 'کردستان', slug: 'kurdistan', newsCount: 25, isLocal: false, color: 'from-green-500 to-lime-600', icon: '⛰️' },
  { id: 12, name: 'هرمزگان', slug: 'hormozgan', newsCount: 45, isLocal: false, color: 'from-cyan-500 to-blue-500', icon: '🏝️' },
];

export default function OstanhaContent() {
  return (
    <>
      <Header />
      <main className="bg-gray-50 min-h-screen">
        <div className="site-container py-10">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-1.5 h-10 bg-gradient-to-b from-[#C9A96E] to-[#1B365D] rounded-full" />
              <h1 className="text-3xl font-black text-[#1B365D]">اخبار استانها</h1>
            </div>
            <div className="flex items-center gap-4 pr-5">
              <p className="text-gray-500 text-sm">آخرین اخبار سراسر کشور از استان بوشهر تا تهران</p>
              <Link href="/" className="text-sm text-[#1B365D] hover:text-[#C9A96E] font-bold transition-colors flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                صفحه اصلی
              </Link>
            </div>
          </div>

          <div className="mb-10">
            <div className="bg-gradient-to-l from-[#1B365D] to-[#2E5090] rounded-2xl p-8 text-white relative overflow-hidden">
              <div className="absolute top-0 left-0 w-40 h-40 bg-[#C9A96E]/10 rounded-full -translate-x-1/2 -translate-y-1/2" />
              <div className="absolute bottom-0 right-0 w-60 h-60 bg-[#C9A96E]/5 rounded-full translate-x-1/3 translate-y-1/3" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-4xl">🌊</span>
                  <span className="bg-[#C9A96E] text-[#1B365D] text-xs px-3 py-1 rounded-full font-bold">ویژه</span>
                </div>
                <h2 className="text-2xl font-black mb-2">استان بوشهر</h2>
                <p className="text-white/70 text-sm mb-4">پایگاه خبری لیان دید، تخصصی‌ترین اخبار استان بوشهر</p>
                <Link href="/category/bushehr" className="inline-flex items-center gap-2 bg-white text-[#1B365D] px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-[#C9A96E] hover:text-[#1B365D] transition-all">
                  مشاهده اخبار بوشهر
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {provinces.map((province) => (
              <Link
                key={province.id}
                href={`/category/${province.slug}`}
                className="group bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${province.color} flex items-center justify-center text-2xl shadow-lg`}>
                    {province.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-black text-[#1B365D] group-hover:text-[#C9A96E] transition-colors">
                      {province.name}
                    </h3>
                    <span className="text-xs text-gray-400">{province.newsCount} خبر</span>
                  </div>
                  <svg className="w-5 h-5 text-gray-300 group-hover:text-[#C9A96E] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
