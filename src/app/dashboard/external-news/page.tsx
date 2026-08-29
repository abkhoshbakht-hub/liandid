'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface ExternalNews {
  id: string;
  title: string;
  link: string;
  description: string;
  image: string;
  source: string;
  sourceName: string;
  category: string;
  status: string;
  isBreaking: boolean;
  publishedAt: string | null;
  fetchedAt: string;
}

export default function ExternalNewsPage() {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const router = useRouter();
  const [news, setNews] = useState<ExternalNews[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'BREAKING'>('all');
  const [selected, setSelected] = useState<string[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isAdmin)) {
      router.push('/secure-a2x-admin');
    }
  }, [isAuthenticated, isAdmin, isLoading, router]);

  useEffect(() => {
    if (isAuthenticated && isAdmin) fetchNews();
  }, [isAuthenticated, isAdmin]);

  const fetchNews = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter === 'BREAKING') {
        params.set('breaking', 'true');
      } else if (filter !== 'all') {
        params.set('status', filter);
      }
      const res = await fetch(`/api/admin/external-news?${params}`);
      const data = await res.json();
      if (data.success) {
        setNews(data.data);
        setPendingCount(data.pendingCount);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && isAdmin) fetchNews();
  }, [filter]);

  const handleStatus = async (ids: string[], status: string) => {
    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/external-news', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids, status }),
      });
      const data = await res.json();
      if (data.success) {
        setSelected([]);
        fetchNews();
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('آیا از حذف این خبر مطمئن هستید؟')) return;
    try {
      const res = await fetch(`/api/admin/external-news/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) fetchNews();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleToggleBreaking = async (id: string, currentValue: boolean) => {
    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/external-news', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: [id], isBreaking: !currentValue }),
      });
      const data = await res.json();
      if (data.success) fetchNews();
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const toggleSelect = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    if (selected.length === news.length) {
      setSelected([]);
    } else {
      setSelected(news.map(n => n.id));
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    try {
      return new Date(dateStr).toLocaleDateString('fa-IR', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '-';
    }
  };

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      APPROVED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
    };
    const labels: Record<string, string> = {
      PENDING: 'در انتظار',
      APPROVED: 'تایید شده',
      REJECTED: 'رد شده',
    };
    return (
      <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${styles[status] || ''}`}>
        {labels[status] || status}
      </span>
    );
  };

  if (isLoading || !isAuthenticated || !isAdmin) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-[#C9A96E] border-t-transparent rounded-full" /></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#1B365D] text-white py-4">
        <div className="site-container flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-[#C9A96E] hover:text-white transition-colors">بازگشت</Link>
            <h1 className="text-xl font-bold">اخبار خبرگزاری‌ها</h1>
            {pendingCount > 0 && (
              <span className="bg-yellow-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                {pendingCount} در انتظار تایید
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="site-container py-6">
        {/* فیلترها */}
        <div className="flex gap-2 mb-4 flex-wrap">
          {([
            { key: 'all' as const, label: 'همه' },
            { key: 'PENDING' as const, label: 'در انتظار تایید' },
            { key: 'APPROVED' as const, label: 'تایید شده' },
            { key: 'REJECTED' as const, label: 'رد شده' },
            { key: 'BREAKING' as const, label: 'خبر فوری' },
          ]).map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === f.key
                  ? 'bg-[#1B365D] text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-[#C9A96E]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* دکمه‌های عملیات گروهی */}
        {selected.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 flex items-center gap-3">
            <span className="text-sm text-blue-800">{selected.length} مورد انتخاب شده</span>
            <button
              onClick={() => handleStatus(selected, 'APPROVED')}
              disabled={actionLoading}
              className="px-4 py-1.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50"
            >
              تایید همه
            </button>
            <button
              onClick={() => handleStatus(selected, 'REJECTED')}
              disabled={actionLoading}
              className="px-4 py-1.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50"
            >
              رد همه
            </button>
            <button
              onClick={() => setSelected([])}
              className="px-4 py-1.5 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300"
            >
              لغو انتخاب
            </button>
          </div>
        )}

        {/* لیست اخبار */}
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin w-8 h-8 border-4 border-[#C9A96E] border-t-transparent rounded-full mx-auto" />
          </div>
        ) : news.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
            <p className="text-gray-500">خبری یافت نشد</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            {/* هدر جدول */}
            <div className="bg-gray-50 px-6 py-3 flex items-center gap-4 border-b border-gray-100">
              <input
                type="checkbox"
                checked={selected.length === news.length && news.length > 0}
                onChange={toggleSelectAll}
                className="w-4 h-4 rounded"
              />
              <span className="text-xs text-gray-500 w-8">#</span>
              <span className="text-xs text-gray-500 flex-1">عنوان خبر</span>
              <span className="text-xs text-gray-500 w-24">منبع</span>
              <span className="text-xs text-gray-500 w-28">تاریخ انتشار</span>
              <span className="text-xs text-gray-500 w-20">وضعیت</span>
              <span className="text-xs text-gray-500 w-40">عملیات</span>
            </div>

            {/* ردیف‌ها */}
            <div className="divide-y divide-gray-50">
              {news.map((item, index) => (
                <div key={item.id} className="px-6 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                  <input
                    type="checkbox"
                    checked={selected.includes(item.id)}
                    onChange={() => toggleSelect(item.id)}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-xs text-gray-400 w-8">{index + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {statusBadge(item.status)}
                      {item.isBreaking && (
                        <span className="text-[11px] px-2 py-0.5 rounded-full font-bold bg-red-100 text-red-700">
                          فوری
                        </span>
                      )}
                    </div>
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-bold text-gray-800 hover:text-[#1B365D] line-clamp-1"
                    >
                      {item.title}
                    </a>
                    {item.description && (
                      <p className="text-xs text-gray-400 line-clamp-1 mt-1">{item.description}</p>
                    )}
                  </div>
                  <span className="text-xs text-gray-500 w-24">{item.sourceName}</span>
                  <span className="text-xs text-gray-400 w-28">{formatDate(item.publishedAt)}</span>
                  <div className="w-20">{statusBadge(item.status)}</div>
                  <div className="flex items-center gap-1 w-40">
                    {item.status !== 'APPROVED' && (
                      <button
                        onClick={() => handleStatus([item.id], 'APPROVED')}
                        disabled={actionLoading}
                        className="px-3 py-1 bg-green-50 text-green-700 rounded text-xs font-medium hover:bg-green-100 disabled:opacity-50"
                      >
                        تایید
                      </button>
                    )}
                    {item.status !== 'REJECTED' && (
                      <button
                        onClick={() => handleStatus([item.id], 'REJECTED')}
                        disabled={actionLoading}
                        className="px-3 py-1 bg-red-50 text-red-700 rounded text-xs font-medium hover:bg-red-100 disabled:opacity-50"
                      >
                        رد
                      </button>
                    )}
                    <button
                      onClick={() => handleToggleBreaking(item.id, item.isBreaking)}
                      disabled={actionLoading}
                      className={`px-3 py-1 rounded text-xs font-medium disabled:opacity-50 ${
                        item.isBreaking
                          ? 'bg-red-500 text-white hover:bg-red-600'
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}
                    >
                      {item.isBreaking ? 'فوری ✓' : 'فوری'}
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="px-3 py-1 bg-gray-100 text-gray-500 rounded text-xs font-medium hover:bg-gray-200"
                    >
                      حذف
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
