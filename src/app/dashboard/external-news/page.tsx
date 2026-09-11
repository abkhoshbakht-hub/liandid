'use client';

import { useState, useEffect, useMemo } from 'react';
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
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const PAGE_SIZE = 20;
  // مانیتورینگ Sync
  interface SyncSummary {
    startedAt: string; finishedAt: string | null; durationMs: number | null; status: string;
    totalSources: number; successSources: number; failedSources: number;
    newItems: number; updatedItems: number; errorSummary: string | null; triggerType: string;
  }
  const [lastSync, setLastSync] = useState<SyncSummary | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState('');
  // فیلترهای تکمیلی
  const [sourceSel, setSourceSel] = useState('');
  const [sources, setSources] = useState<string[]>([]);
  const [hasImage, setHasImage] = useState(false);
  const [olderThan, setOlderThan] = useState('');
  const [dateStr, setDateStr] = useState('');

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isAdmin)) {
      router.push('/secure-a2x-admin');
    }
  }, [isAuthenticated, isAdmin, isLoading, router]);

  useEffect(() => {
    if (isAuthenticated && isAdmin) fetchNews();
  }, [isAuthenticated, isAdmin]);

  const fetchNews = async (pageNum: number = page) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(pageNum));
      params.set('limit', String(PAGE_SIZE));
      if (filter === 'BREAKING') {
        params.set('breaking', 'true');
      } else if (filter !== 'all') {
        params.set('status', filter);
      }
      if (sourceSel) params.set('source', sourceSel);
      if (hasImage) params.set('hasImage', 'true');
      if (olderThan) params.set('olderThan', olderThan);
      if (dateStr) params.set('date', dateStr);
      const res = await fetch(`/api/admin/external-news?${params}`);
      const data = await res.json();
      if (data.success) {
        setNews(data.data);
        setPendingCount(data.pendingCount);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotal(data.pagination?.total || 0);
        setSelected([]);
        if (data.lastSync) setLastSync(data.lastSync);
        if (Array.isArray(data.sources)) setSources(data.sources);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const changePage = (p: number) => {
    if (p < 1 || p > totalPages || p === page) return;
    setPage(p);
    fetchNews(p);
  };

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      setPage(1);
      setSelected([]);
      fetchNews(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, sourceSel, hasImage, olderThan, dateStr]);

  const runSyncNow = async () => {
    setSyncing(true);
    setSyncMsg('');
    try {
      const res = await fetch('/api/rss/refresh', { method: 'POST' });
      const data = await res.json();
      if (data.success && data.data && !data.data.skipped) {
        const d = data.data;
        setSyncMsg(`دریافت شد: ${d.newItems || 0} جدید، ${d.updatedItems || 0} به‌روزرسانی، ${d.successSources || 0}/${d.totalSources || 0} منبع موفق`);
        fetchNews(1);
      } else if (data?.data?.skipped) {
        setSyncMsg('یک دریافت دیگر در حال اجراست؛ چند دقیقه بعد تلاش کنید');
      } else {
        setSyncMsg(data.message || 'خطا در دریافت');
      }
    } catch {
      setSyncMsg('خطا در دریافت');
    } finally {
      setSyncing(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selected.length === 0) return;
    if (!confirm(`${selected.length} خبر حذف شود؟`)) return;
    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/external-news', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selected }),
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

  const relFa = (iso: string | null | undefined) => {
    if (!iso) return '—';
    const diff = Date.now() - new Date(iso).getTime();
    if (Number.isNaN(diff) || diff < 0) return '—';
    const m = Math.floor(diff / 60000);
    if (m < 1) return 'لحظاتی قبل';
    if (m < 60) return `${m} دقیقه قبل`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h} ساعت قبل`;
    return `${Math.floor(h / 24)} روز قبل`;
  };

  const isSyncStale = useMemo(() => {
    if (!lastSync) return false;
    const ref = lastSync.finishedAt || lastSync.startedAt;
    if (!ref || lastSync.status === 'RUNNING') return false;
    return Date.now() - new Date(ref).getTime() > 30 * 60000;
  }, [lastSync]);

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
          <button
            onClick={runSyncNow}
            disabled={syncing}
            className="bg-[#C9A96E] text-[#0f1d35] text-sm font-bold px-4 py-2 rounded-lg hover:brightness-110 disabled:opacity-50"
          >
            {syncing ? 'در حال دریافت...' : 'دریافت هم‌اکنون'}
          </button>
        </div>
      </div>

      <div className="site-container py-6">
        {/* مانیتورینگ Sync */}
        <div className="bg-white rounded-xl border border-gray-100 p-4 mb-4 text-sm">
          {lastSync ? (
            <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
              <span className="text-gray-500">آخرین دریافت: <b className="text-gray-800">{relFa(lastSync.finishedAt || lastSync.startedAt)}</b></span>
              <span className="text-gray-500">وضعیت: <b className={lastSync.status === 'SUCCESS' ? 'text-green-700' : lastSync.status === 'PARTIAL' ? 'text-yellow-700' : 'text-red-600'}>{lastSync.status === 'SUCCESS' ? 'موفق' : lastSync.status === 'PARTIAL' ? 'ناقص' : lastSync.status === 'RUNNING' ? 'در حال اجرا' : 'ناموفق'}</b></span>
              <span className="text-gray-500">خبر جدید: <b className="text-gray-800">{lastSync.newItems ?? 0}</b></span>
              <span className="text-gray-500">منابع: <b className="text-gray-800">{lastSync.successSources ?? 0}/{lastSync.totalSources ?? 0} موفق</b></span>
              {isSyncStale && <span className="text-red-600 font-bold">سیستم دریافت اخبار به‌موقع اجرا نشده است</span>}
            </div>
          ) : (
            <span className="text-gray-400">هنوز هیچ دریافتی ثبت نشده است</span>
          )}
          {syncMsg && <div className="text-xs text-gray-500 mt-2">{syncMsg}</div>}
        </div>
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

        {/* فیلترهای تکمیلی */}
        <div className="flex gap-2 mb-4 flex-wrap items-center bg-white border border-gray-100 rounded-xl p-3">
          <select value={sourceSel} onChange={(e) => setSourceSel(e.target.value)} className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm">
            <option value="">همه منابع</option>
            {sources.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <input type="date" value={dateStr} onChange={(e) => setDateStr(e.target.value)} className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm" />
          <label className="flex items-center gap-1.5 text-sm text-gray-600">
            <input type="checkbox" checked={hasImage} onChange={(e) => setHasImage(e.target.checked)} className="w-4 h-4 rounded" />
            فقط دارای تصویر
          </label>
          <label className="flex items-center gap-1.5 text-sm text-gray-600">
            قدیمی‌تر از
            <input type="number" min="1" max="365" value={olderThan} onChange={(e) => setOlderThan(e.target.value)} className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm w-20" placeholder="روز" />
            روز
          </label>
          {(sourceSel || hasImage || olderThan || dateStr) && (
            <button onClick={() => { setSourceSel(''); setHasImage(false); setOlderThan(''); setDateStr(''); }} className="text-xs text-gray-500 hover:text-red-600">حذف فیلترها</button>
          )}
        </div>

        {/* دکمه‌های عملیات گروهی */}
        {selected.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 flex items-center gap-3 flex-wrap">
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
              onClick={handleBulkDelete}
              disabled={actionLoading}
              className="px-4 py-1.5 bg-gray-700 text-white rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50"
            >
              حذف همه
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
          <div className="bg-white rounded-2xl border border-gray-100 overflow-x-auto">
            {/* هدر جدول */}
            <div className="bg-gray-50 px-6 py-3 flex items-center gap-4 border-b border-gray-100 min-w-[780px]">
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
                <div key={item.id} className="px-6 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors min-w-[780px]">
                  <input
                    type="checkbox"
                    checked={selected.includes(item.id)}
                    onChange={() => toggleSelect(item.id)}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-xs text-gray-400 w-8">{(page - 1) * PAGE_SIZE + index + 1}</span>
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

        {/* صفحه‌بندی */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6 flex-wrap" dir="rtl">
            <span className="text-xs text-gray-400 ml-2">مجموع: {total} خبر</span>
            <button
              onClick={() => changePage(page - 1)}
              disabled={page <= 1}
              className="px-3 py-2 rounded-lg text-[13px] font-bold bg-white text-gray-600 border border-gray-200 hover:border-[#1B365D] hover:text-[#1B365D] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              قبلی
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
              .reduce<number[]>((acc, p) => {
                const prev = acc[acc.length - 1];
                if (prev !== undefined && p - prev > 1) acc.push(-1);
                acc.push(p);
                return acc;
              }, [])
              .map((p, i) =>
                p === -1 ? (
                  <span key={`gap-${i}`} className="text-gray-300 px-1">...</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => changePage(p)}
                    className={`w-9 h-9 flex items-center justify-center rounded-lg text-[13px] font-black transition-all ${
                      p === page
                        ? 'bg-[#1B365D] text-white shadow'
                        : 'bg-white text-gray-600 border border-gray-200 hover:border-[#1B365D] hover:text-[#1B365D]'
                    }`}
                  >
                    {p.toLocaleString('fa-IR')}
                  </button>
                )
              )}
            <button
              onClick={() => changePage(page + 1)}
              disabled={page >= totalPages}
              className="px-3 py-2 rounded-lg text-[13px] font-bold bg-white text-gray-600 border border-gray-200 hover:border-[#1B365D] hover:text-[#1B365D] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              بعدی
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
