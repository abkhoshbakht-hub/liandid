'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const galleries = [
  { id: 1, title: 'تصاویر مراسم روز قدس', category: 'سیاسی', date: '۲۶ تیر ۱۴۰۵', count: 24, color: 'from-blue-500 to-blue-700' },
  { id: 2, title: 'جشنواره غذاهای محلی بوشهر', category: 'فرهنگی', date: '۲۵ تیر ۱۴۰۵', count: 18, color: 'from-amber-500 to-orange-600' },
  { id: 3, title: 'مسابقات فوتبال ساحلی', category: 'ورزشی', date: '۲۴ تیر ۱۴۰۵', count: 32, color: 'from-green-500 to-emerald-600' },
  { id: 4, title: 'بازدید مقامات از پالایشگاه', category: 'اقتصادی', date: '۲۳ تیر ۱۴۰۵', count: 12, color: 'from-purple-500 to-indigo-600' },
  { id: 5, title: 'نمایشگاه نقاشی کودکان', category: 'فرهنگی', date: '۲۲ تیر ۱۴۰۵', count: 20, color: 'from-pink-500 to-rose-500' },
  { id: 6, title: 'عملیات نجات دریایی', category: 'اجتماعی', date: '۲۱ تیر ۱۴۰۵', count: 8, color: 'from-cyan-500 to-teal-500' },
];

const filters = ['همه', 'سیاسی', 'اقتصادی', 'اجتماعی', 'فرهنگی', 'ورزشی'];

export default function GalleryContent() {
  const [activeFilter, setActiveFilter] = useState('همه');
  const filtered = activeFilter === 'همه' ? galleries : galleries.filter(g => g.category === activeFilter);

  return (
    <>
      <Header />
      <main className="bg-gray-50 min-h-screen">
        <div className="site-container py-10">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-1.5 h-10 bg-gradient-to-b from-[#C9A96E] to-[#1B365D] rounded-full" />
              <h1 className="text-3xl font-black text-[#1B365D]">گالری تصاویر</h1>
            </div>
            <div className="flex items-center gap-4 pr-5">
              <p className="text-gray-500 text-sm">مجموعه تصاویر رویدادها و اخبار استان بوشهر</p>
              <Link href="/" className="text-sm text-[#1B365D] hover:text-[#C9A96E] font-bold transition-colors flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                صفحه اصلی
              </Link>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mb-8">
            {filters.map((f) => (
              <button key={f} onClick={() => setActiveFilter(f)} className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all ${activeFilter === f ? 'bg-[#1B365D] text-white shadow-lg' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}>
                {f}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((gallery) => (
              <div key={gallery.id} className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300 cursor-pointer">
                <div className={`relative h-56 bg-gradient-to-br ${gallery.color}`}>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                  <div className="absolute top-4 right-4">
                    <span className="bg-white/90 text-gray-800 text-xs px-3 py-1.5 rounded-full font-bold shadow-md">{gallery.category}</span>
                  </div>
                  <div className="absolute bottom-4 left-4">
                    <span className="bg-black/50 text-white text-xs px-3 py-1.5 rounded-full font-bold backdrop-blur-sm">📷 {gallery.count} تصویر</span>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-black text-[#1B365D] group-hover:text-[#C9A96E] transition-colors text-lg mb-2">{gallery.title}</h3>
                  <span className="text-xs text-gray-400">{gallery.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
