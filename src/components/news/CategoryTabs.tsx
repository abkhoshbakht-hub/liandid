'use client';

import { useState, useEffect } from 'react';
import { timeAgo } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';

interface NewsItem {
  id: string;
  title: string;
  link: string;
  description: string | null;
  image: string | null;
  source: string;
  sourceName: string;
  category: string | null;
  publishedAt: string | null;
  isCustom: boolean;
}

const defaultColors: Record<string, string> = {
  'بوشهر': '#1B365D',
  'سیاسی': '#1B365D',
  'اقتصادی': '#0f766e',
  'اجتماعی': '#c2410c',
  'ورزشی': '#15803d',
  'فرهنگی': '#a21caf',
  'فناوری': '#0369a1',
  'علمی': '#4f46e5',
  'حوادث': '#dc2626',
  'بین\u200cالملل': '#7c3aed',
};

export default function CategoryTabs({ categoryNews }: { categoryNews: Record<string, NewsItem[]> }) {
  const [activeTab, setActiveTab] = useState('');
  const [catColors, setCatColors] = useState<Record<string, string>>(defaultColors);
  const [catOrder, setCatOrder] = useState<Record<string, number>>({});
  const rawCategories = Object.keys(categoryNews);
  const categories = [...rawCategories].sort((a, b) => (catOrder[a] ?? 999) - (catOrder[b] ?? 999));

  useEffect(() => {
    fetch('/api/admin/categories').then(r => r.json()).then(data => {
      if (data.success) {
        const colorMap: Record<string, string> = { ...defaultColors };
        const orderMap: Record<string, number> = {};
        data.data.forEach((c: any) => {
          if (c.color) colorMap[c.name] = c.color;
          if (typeof c.order === 'number') orderMap[c.name] = c.order;
        });
        setCatColors(colorMap);
        setCatOrder(orderMap);
      }
    }).catch(() => {});
  }, []);

  if (categories.length === 0) return null;

  return (
    <div className="mt-4">
      {/* تب‌های ساده */}
      <div className="flex gap-0 border-b border-gray-200 mb-6 overflow-x-auto scrollbar-hide">
        {categories.map((cat) => {
          const isActive = activeTab === cat;
          const count = categoryNews[cat]?.length || 0;
          const color = catColors[cat] || '#6b7280';
          return (
            <button
              key={cat}
              onClick={() => setActiveTab(isActive ? '' : cat)}
              className={`relative px-6 py-3 text-sm font-bold whitespace-nowrap transition-all ${
                isActive
                  ? 'text-[#1B365D]'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {cat}
              <span className={`mr-1.5 text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                isActive ? 'bg-[#1B365D] text-white' : 'bg-gray-100 text-gray-400'
              }`}>
                {count}
              </span>
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full" style={{ backgroundColor: catColors[cat] || '#6b7280' }} />
              )}
            </button>
          );
        })}
      </div>

      {/* نتیجه */}
      {activeTab && categoryNews[activeTab] && (
        <>
          {/* هدر */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <span className="w-1 h-6 rounded-full" style={{ backgroundColor: (catColors[activeTab] || '#6b7280') }} />
              <h3 className="text-lg font-black text-gray-900">اخبار {activeTab}</h3>
              <span className="text-xs text-gray-400">{categoryNews[activeTab].length} خبر</span>
            </div>
            <Link href={`/category/${activeTab === 'بوشهر' ? 'bushahr' : activeTab}`} className="text-xs text-[#C9A96E] font-bold hover:text-[#a8834f] transition-colors">
              مشاهده همه ←
            </Link>
          </div>

          {/* کارت‌ها */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {categoryNews[activeTab].map((news: NewsItem) => (
              <a
                key={news.id}
                href={news.link}
                target="_blank"
                rel="noopener noreferrer"
                className="group block bg-white rounded-xl overflow-hidden border border-gray-100 hover:shadow-lg hover:shadow-gray-200/50 transition-all duration-300"
              >
                <div className="relative h-40 overflow-hidden bg-gray-100">
                  {news.image ? (
                    <img
                      src={news.image}
                      alt={news.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: (catColors[activeTab] || '#6b7280') }}>
                      <span className="text-white/30 text-3xl font-black">{activeTab[0]}</span>
                    </div>
                  )}
                  {news.sourceName && (
                    <span className="absolute bottom-2 left-2 text-[10px] px-2 py-0.5 rounded bg-white/90 text-gray-600 font-bold shadow-sm">
                      {news.sourceName}
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <h4 className="font-bold text-gray-800 group-hover:text-[#1B365D] transition-colors line-clamp-2 text-sm leading-relaxed">
                    {news.title}
                  </h4>
                  <p className="text-[11px] text-gray-400 mt-2">{timeAgo(news.publishedAt)}</p>
                </div>
              </a>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
