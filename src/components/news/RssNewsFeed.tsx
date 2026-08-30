'use client';

import { useState, useEffect } from 'react';

interface RssNews {
  id: string;
  title: string;
  link: string;
  description: string;
  image: string;
  source: string;
  sourceName: string;
  category: string | null;
  publishedAt: string | null;
}

export default function RssNewsFeed() {
  const [news, setNews] = useState<RssNews[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'ملی' | 'بوشهر'>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const fetchNews = async (category?: string) => {
    try {
      const params = new URLSearchParams();
      if (category && category !== 'all') params.set('category', category);

      const res = await fetch(`/api/rss?${params}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setNews(data.data);
      }
    } catch (error) {
      console.error('Error fetching RSS:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNews(activeTab);
  }, [activeTab]);

  const handleRefresh = async () => {
    setRefreshing(true);
    fetch('/api/rss?refresh=true').then(() => fetchNews(activeTab)).catch(() => setRefreshing(false));
  };

  const MOBILE_INITIAL = 8;

  const filteredNews = !news ? [] : (activeTab === 'all'
    ? news
    : news.filter(n => n.category === activeTab)
  );

  const visibleNews = (isMobile && !showMore) ? filteredNews.slice(0, MOBILE_INITIAL) : filteredNews;
  const hasMore = isMobile && filteredNews.length > MOBILE_INITIAL;

  const formatTime = (dateStr: string | null) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    if (minutes < 1) return 'همین الان';
    if (minutes < 60) return `${minutes} دقیقه پیش`;
    if (hours < 24) return `${hours} ساعت پیش`;
    return date.toLocaleDateString('fa-IR');
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm h-full flex flex-col">
      {/* هدر */}
      <div className="bg-gradient-to-l from-[#1B365D] to-[#2a4a7a] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 5c7.18 0 13 5.82 13 13M6 11a7 7 0 017 7m-6 0a1 1 0 11-2 0 1 1 0 012 0z" />
            </svg>
          </div>
          <h2 className="text-base font-extrabold text-white">اخبار لحظه‌ای خبرگزاری‌ها</h2>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="text-xs text-white/70 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 disabled:opacity-50"
        >
          <svg className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {refreshing ? 'بروزرسانی...' : 'بروزرسانی'}
        </button>
      </div>

      {/* تب‌ها */}
      <div className="border-b border-gray-100 px-6">
        <div className="flex gap-0 justify-center md:justify-start">
          {[
            { key: 'all' as const, label: 'همه' },
            { key: 'بوشهر' as const, label: 'خبر بوشهر' },
            { key: 'ملی' as const, label: 'خبرگزاری‌های سراسری' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); setShowMore(false); }}
              className={`px-5 py-3 text-[13px] font-bold border-b-2 transition-all ${
                activeTab === tab.key
                  ? 'border-[#C9A96E] text-[#1B365D]'
                  : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* لیست اخبار */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-2 border-[#C9A96E] border-t-[#1B365D] rounded-full animate-spin mx-auto" />
            <p className="text-sm text-gray-400 mt-4">در حال دریافت اخبار...</p>
          </div>
        ) : filteredNews.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <p className="text-sm">خبری یافت نشد</p>
            <button onClick={handleRefresh} className="text-xs text-[#1B365D] hover:text-[#C9A96E] mt-2 font-bold">
              بروزرسانی
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {visibleNews.map((item) => (
              <a
                key={item.id}
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="block px-4 py-3 hover:bg-gray-50 transition-colors group"
              >
                <div className="flex gap-3">
                  {item.image && (
                    <div className="w-16 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[12px] font-bold text-gray-800 group-hover:text-[#1B365D] transition-colors line-clamp-2 leading-relaxed">
                      {item.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[10px] font-bold text-[#C9A96E] bg-[#C9A96E]/10 px-1.5 py-0.5 rounded">
                        {item.sourceName}
                      </span>
                      {item.publishedAt && (
                        <span className="text-[10px] text-gray-400">
                          {formatTime(item.publishedAt)}
                        </span>
                      )}
                      {item.category && (
                        <span className="text-[10px] text-gray-400">
                          {item.category}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </a>
            ))}
            {hasMore && (
              <button
                onClick={() => setShowMore(true)}
                className="w-full py-3 text-sm font-bold text-[#1B365D] hover:text-[#C9A96E] transition-colors"
              >
                اخبار بیشتر
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
