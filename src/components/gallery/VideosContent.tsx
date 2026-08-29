'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const videos = [
  { id: 1, title: 'گزارش تصویری از اجلاس سران کشورهای منطقه', category: 'سیاسی', date: '۲۶ تیر ۱۴۰۵', duration: '۱۲:۳۴', views: '۲.۳K', color: 'from-blue-500 to-blue-700' },
  { id: 2, title: 'مستند جشنواره غذاهای محلی بوشهر', category: 'فرهنگی', date: '۲۵ تیر ۱۴۰۵', duration: '۰۸:۲۱', views: '۵.۱K', color: 'from-amber-500 to-orange-600' },
  { id: 3, title: 'پخش زنده فینال مسابقات فوتبال ساحلی', category: 'ورزشی', date: '۲۴ تیر ۱۴۰۵', duration: '۴۵:۰۰', views: '۱۲K', color: 'from-green-500 to-emerald-600' },
  { id: 4, title: 'گفتگوی اختصاصی با مدیرعامل پالایشگاه', category: 'اقتصادی', date: '۲۳ تیر ۱۴۰۵', duration: '۱۸:۴۵', views: '۱.۸K', color: 'from-purple-500 to-indigo-600' },
  { id: 5, title: 'کلیپ نمایشگاه نقاشی کودکان بوشهری', category: 'فرهنگی', date: '۲۲ تیر ۱۴۰۵', duration: '۰۵:۱۲', views: '۳.۴K', color: 'from-pink-500 to-rose-500' },
  { id: 6, title: 'فیلم عملیات نجات دریایی در ساحل بوشهر', category: 'اجتماعی', date: '۲۱ تیر ۱۴۰۵', duration: '۱۰:۰۸', views: '۸.۷K', color: 'from-cyan-500 to-teal-500' },
];

const filters = ['همه', 'سیاسی', 'اقتصادی', 'اجتماعی', 'فرهنگی', 'ورزشی'];

export default function VideosContent() {
  const [activeFilter, setActiveFilter] = useState('همه');
  const filtered = activeFilter === 'همه' ? videos : videos.filter(v => v.category === activeFilter);

  return (
    <>
      <Header />
      <main className="bg-gray-50 min-h-screen">
        <div className="site-container py-10">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-1.5 h-10 bg-gradient-to-b from-[#C9A96E] to-[#1B365D] rounded-full" />
              <h1 className="text-3xl font-black text-[#1B365D]">گالری فیلم</h1>
            </div>
            <div className="flex items-center gap-4 pr-5">
              <p className="text-gray-500 text-sm">مجموعه فیلم‌ها و ویدیوهای رویدادها و اخبار استان بوشهر</p>
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
            {filtered.map((video) => (
              <div key={video.id} className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300 cursor-pointer">
                <div className={`relative h-56 bg-gradient-to-br ${video.color}`}>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-7 h-7 text-white mr-[-2px]" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </div>
                  </div>
                  <div className="absolute top-4 right-4">
                    <span className="bg-white/90 text-gray-800 text-xs px-3 py-1.5 rounded-full font-bold shadow-md">{video.category}</span>
                  </div>
                  <div className="absolute bottom-4 left-4 flex items-center gap-2">
                    <span className="bg-black/50 text-white text-xs px-3 py-1.5 rounded-full font-bold backdrop-blur-sm">{video.duration}</span>
                    <span className="bg-black/50 text-white text-xs px-3 py-1.5 rounded-full font-bold backdrop-blur-sm">{video.views} بازدید</span>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-black text-[#1B365D] group-hover:text-[#C9A96E] transition-colors text-lg mb-2">{video.title}</h3>
                  <span className="text-xs text-gray-400">{video.date}</span>
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
