'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';

interface Article {
  id: string;
  title: string;
  slug: string;
  subtitle?: string;
  excerpt?: string;
  featuredImage?: string;
  publishedAt?: string;
  viewCount: number;
  author: { name: string };
  category: { name: string; slug: string; color?: string };
  tags: { name: string; slug: string }[];
}

export default function SearchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<Article[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const doSearch = useCallback(async (q: string, p: number) => {
    if (!q.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(`/api/articles?search=${encodeURIComponent(q)}&page=${p}&limit=12`);
      const data = await res.json();
      if (data.success) {
        setResults(data.data);
        setTotal(data.pagination.total);
        setTotalPages(data.pagination.totalPages);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialQuery) {
      doSearch(initialQuery, 1);
    }
  }, [initialQuery, doSearch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    doSearch(query, 1);
    const url = new URL(window.location.href);
    url.searchParams.set('q', query);
    window.history.replaceState({}, '', url.toString());
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    doSearch(query, newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('fa-IR');
    } catch {
      return '';
    }
  };

  return (
    <main className="bg-gray-50 min-h-screen">
      <div className="site-container py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <h1 className="text-2xl font-black text-[#1B365D] mb-4">جستجو در اخبار</h1>
          <form onSubmit={handleSubmit} className="flex gap-3">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="کلمه مورد نظر را تایپ کنید..."
              className="flex-1 px-5 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#C9A96E] focus:ring-2 focus:ring-[#C9A96E]/10 transition-all"
              autoFocus
            />
            <button
              type="submit"
              className="px-8 py-3 bg-[#1B365D] text-white rounded-xl font-medium hover:bg-[#2a4a7a] transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              جستجو
            </button>
          </form>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block w-10 h-10 border-4 border-[#C9A96E] border-t-transparent rounded-full animate-spin" />
            <p className="mt-4 text-gray-500">در حال جستجو...</p>
          </div>
        ) : searched ? (
          results.length > 0 ? (
            <>
              <p className="text-sm text-gray-500 mb-6">
                {total.toLocaleString('fa-IR')} نتیجه برای &quot;{initialQuery}&quot; یافت شد
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.map((article) => (
                  <a
                    key={article.id}
                    href={`/news/${article.slug}`}
                    className="block bg-white rounded-2xl border border-gray-100 hover:border-[#C9A96E]/30 overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-[#1B365D]/5 group"
                  >
                    {article.featuredImage && (
                      <div className="relative h-48 bg-gray-100">
                        <img
                          src={article.featuredImage}
                          alt={article.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <div className="p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <span
                          className="text-[10px] px-2.5 py-1 rounded-full font-bold text-white"
                          style={{ backgroundColor: article.category?.color || '#1B365D' }}
                        >
                          {article.category?.name}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          {formatDate(article.publishedAt)}
                        </span>
                      </div>
                      <h3 className="font-black text-[#1B365D] group-hover:text-[#C9A96E] transition-colors text-base leading-relaxed line-clamp-2 mb-2">
                        {article.title}
                      </h3>
                      {article.excerpt && (
                        <p className="text-sm text-gray-500 line-clamp-2">{article.excerpt}</p>
                      )}
                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100 text-xs text-gray-400">
                        <span>{article.author?.name}</span>
                        <span className="flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          {article.viewCount.toLocaleString('fa-IR')}
                        </span>
                      </div>
                    </div>
                  </a>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-10">
                  {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => handlePageChange(p)}
                      className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${
                        p === page
                          ? 'bg-[#1B365D] text-white shadow-md'
                          : 'bg-white text-gray-600 border border-gray-200 hover:border-[#C9A96E] hover:text-[#1B365D]'
                      }`}
                    >
                      {p.toLocaleString('fa-IR')}
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20">
              <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p className="text-gray-500 text-lg">نتیجه‌ای یافت نشد</p>
              <p className="text-gray-400 text-sm mt-2">کلمات کلیدی دیگری امتحان کنید</p>
            </div>
          )
        ) : (
          <div className="text-center py-20">
            <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p className="text-gray-500 text-lg">عبارت مورد نظر خود را جستجو کنید</p>
          </div>
        )}
      </div>
    </main>
  );
}
