'use client';

import Link from 'next/link';

const writers = [
  { id: 1, name: 'علی محمدی', role: 'تحلیلگر اقتصادی', articles: 128, avatar: 'م' },
  { id: 2, name: 'سارا احمدی', role: 'خبرنگار سیاسی', articles: 95, avatar: 'س' },
  { id: 3, name: 'محمد رضایی', role: 'ویراستار ارشد', articles: 210, avatar: 'م' },
  { id: 4, name: 'زهرا کریمی', role: 'تحلیلگر بین‌الملل', articles: 78, avatar: 'ز' },
  { id: 5, name: 'حسن عباسی', role: 'خبرنگار اقتصادی', articles: 156, avatar: 'ح' },
];

export default function FeaturedWriters() {
  return (
    <div className="bg-white rounded-2xl border border-[#1B365D]/10 p-6 mb-10 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-1 h-8 bg-[#C9A96E] rounded-full" />
          <h2 className="text-xl font-black text-[#1B365D]">نویسندگان برگزیده</h2>
        </div>
        <Link href="/writers" className="text-sm text-[#1B365D] hover:text-[#C9A96E] transition-colors">
          مشاهده همه ←
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {writers.map((writer) => (
          <div key={writer.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#1B365D] to-[#2a4a7a] flex items-center justify-center text-white font-bold text-lg">
              {writer.avatar}
            </div>
            <div>
              <div className="font-bold text-sm text-gray-800">{writer.name}</div>
              <div className="text-xs text-gray-500">{writer.role}</div>
              <div className="text-xs text-[#C9A96E] font-bold">{writer.articles} مقاله</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
