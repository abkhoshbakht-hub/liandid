'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const shahrestanha = [
  { slug: 'booshehr', name: 'بوشهر' },
  { slug: 'dayer', name: 'دیر' },
  { slug: 'deylam', name: 'دیلم' },
  { slug: 'genaveh', name: 'گناوه' },
  { slug: 'dashtestan', name: 'دشتستان' },
  { slug: 'dashti', name: 'دشتی' },
  { slug: 'tangestan', name: 'تنگستان' },
  { slug: 'kangan', name: 'کنگان' },
  { slug: 'asaluyeh', name: 'عسلویه' },
  { slug: 'jam', name: 'جم' },
  { slug: 'kharg', name: 'جزیره خارگ' },
];

interface ExternalNews {
  id: string;
  title: string;
  link: string;
  sourceName: string;
  category: string | null;
  status: string;
  region: string | null;
  publishedAt: string | null;
  _type?: 'external' | 'article';
}

export default function RegionsPage() {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const router = useRouter();
  const [activeRegion, setActiveRegion] = useState<string | null>(null); // "jam:city"
  const [assigned, setAssigned] = useState<ExternalNews[]>([]);
  const [assignedLoading, setAssignedLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState<ExternalNews[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isAdmin)) {
      router.push('/secure-a2x-admin');
    }
  }, [isAuthenticated, isAdmin, isLoading, router]);

  const fetchAssigned = useCallback(async (region: string) => {
    setAssignedLoading(true);
    try {
      const [extRes, artRes] = await Promise.all([
        fetch(`/api/admin/external-news?${new URLSearchParams({ status: 'APPROVED', region, limit: '100' })}`),
        fetch(`/api/admin/articles?${new URLSearchParams({ status: 'PUBLISHED', region, limit: '100' })}`),
      ]);
      const extData = await extRes.json();
      const artData = await artRes.json();
      const extItems = (extData.data || []).map((n: any) => ({ ...n, _type: 'external' }));
      const artItems = (artData.data || []).map((a: any) => ({
        id: a.id, title: a.title, link: `/news/${a.slug}`, sourceName: a.author?.name || 'لیان دید',
        category: a.category?.name || null, status: a.status, region: a.region, publishedAt: a.publishedAt, _type: 'article',
      }));
      setAssigned([...extItems, ...artItems]);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setAssignedLoading(false);
    }
  }, []);

  const runSearch = useCallback(async (q: string) => {
    if (!q.trim()) { setSearchResults([]); return; }
    setSearchLoading(true);
    try {
      const [extRes, artRes] = await Promise.all([
        fetch(`/api/admin/external-news?${new URLSearchParams({ status: 'APPROVED', search: q, limit: '10' })}`),
        fetch(`/api/admin/articles?${new URLSearchParams({ status: 'PUBLISHED', search: q, limit: '10' })}`),
      ]);
      const extData = await extRes.json();
      const artData = await artRes.json();
      const extItems = (extData.data || []).map((n: any) => ({ ...n, _type: 'external' }));
      const artItems = (artData.data || []).map((a: any) => ({
        id: a.id, title: a.title, link: `/news/${a.slug}`, sourceName: a.author?.name || 'لیان دید',
        category: a.category?.name || null, status: a.status, region: null, publishedAt: a.publishedAt, _type: 'article',
      }));
      setSearchResults([...extItems, ...artItems]);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setSearchLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => runSearch(search), 400);
    return () => clearTimeout(t);
  }, [search, runSearch]);

  useEffect(() => {
    if (activeRegion) fetchAssigned(activeRegion);
    else { setAssigned([]); setSearch(''); setSearchResults([]); }
  }, [activeRegion, fetchAssigned]);

  const assignNews = async (id: string, region: string, type: string) => {
    setSaving(true);
    try {
      if (type === 'article') {
        const res = await fetch(`/api/admin/articles/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ region }),
        });
        const data = await res.json();
        if (data.success) { setSearchResults([]); setSearch(''); fetchAssigned(region); }
        else alert(data.message || 'خطا در ثبت');
      } else {
        const res = await fetch('/api/admin/external-news', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids: [id], region }),
        });
        const data = await res.json();
        if (data.success) { setSearchResults([]); setSearch(''); fetchAssigned(region); }
        else alert(data.message || 'خطا در ثبت');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setSaving(false);
    }
  };

  const unassignNews = async (id: string, region: string, type: string) => {
    if (!confirm('این خبر از این بخش حذف شود؟')) return;
    setSaving(true);
    try {
      if (type === 'article') {
        await fetch(`/api/admin/articles/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ region: '' }),
        });
        fetchAssigned(region);
      } else {
        await fetch('/api/admin/external-news', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids: [id], region: '' }),
        });
        fetchAssigned(region);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setSaving(false);
    }
  };

  if (isLoading || !isAuthenticated || !isAdmin) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-[#C9A96E] border-t-transparent rounded-full" /></div>;
  }

  const regionName = (r: string) => {
    const [slug, type] = r.split(':');
    const sh = shahrestanha.find(s => s.slug === slug);
    return `${type === 'city' ? 'شهر' : 'روستا'} ${sh?.name || slug}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#1B365D] text-white py-4">
        <div className="site-container flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-[#C9A96E] hover:text-white transition-colors">بازگشت</Link>
            <h1 className="text-xl font-bold">اخبار شهرها و روستاها</h1>
          </div>
        </div>
      </div>

      <div className="site-container py-6">
        {/* انتخاب شهرستان و بخش */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
          <h2 className="text-sm font-bold text-[#1B365D] mb-4 flex items-center gap-2">
            <span className="w-1 h-5 bg-[#C9A96E] rounded-full" />
            انتخاب شهرستان و بخش
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {shahrestanha.map(sh => (
              <div key={sh.slug} className="border border-gray-100 rounded-xl p-3 bg-gray-50">
                <p className="text-sm font-bold text-gray-700 mb-2">{sh.name}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveRegion(activeRegion === `${sh.slug}:city` ? null : `${sh.slug}:city`)}
                    className={`flex-1 px-2 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      activeRegion === `${sh.slug}:city`
                        ? 'bg-[#1B365D] text-white'
                        : 'bg-white text-gray-600 border border-gray-200 hover:border-[#1B365D]'
                    }`}
                  >
                    🏙️ شهر
                  </button>
                  <button
                    onClick={() => setActiveRegion(activeRegion === `${sh.slug}:village` ? null : `${sh.slug}:village`)}
                    className={`flex-1 px-2 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      activeRegion === `${sh.slug}:village`
                        ? 'bg-[#C9A96E] text-white'
                        : 'bg-white text-gray-600 border border-gray-200 hover:border-[#C9A96E]'
                    }`}
                  >
                    🏡 روستا
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {activeRegion && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* بخش اصلی: اخبار اختصاص‌یافته */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="bg-gray-50 px-6 py-3 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-sm font-bold text-[#1B365D]">اخبار بخش «{regionName(activeRegion)}»</h2>
                <Link
                  href={`/category/bushahr/${activeRegion.split(':')[0]}/${activeRegion.split(':')[1]}`}
                  target="_blank"
                  className="text-xs text-[#C9A96E] hover:text-[#1B365D] font-bold transition-colors"
                >
                  مشاهده در سایت ←
                </Link>
              </div>

              {assignedLoading ? (
                <div className="text-center py-16">
                  <div className="animate-spin w-8 h-8 border-4 border-[#C9A96E] border-t-transparent rounded-full mx-auto" />
                </div>
              ) : assigned.length === 0 ? (
                <div className="text-center py-16 px-6">
                  <p className="text-gray-500 text-sm">هنوز خبری به این بخش اختصاص نیافته است</p>
                  <p className="text-gray-400 text-xs mt-2">از جستجو در پایین برای یافتن و افزودن خبر استفاده کنید</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {assigned.map((item, index) => (
                    <div key={item.id} className="px-6 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                      <span className="text-xs text-gray-400 w-6">{index + 1}</span>
                      <div className="flex-1 min-w-0">
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-bold text-gray-800 hover:text-[#1B365D] line-clamp-1"
                        >
                          {item.title}
                        </a>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] text-gray-400">{item.sourceName}</span>
                          {item.category && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold">{item.category}</span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => unassignNews(item.id, activeRegion, item._type || 'external')}
                        disabled={saving}
                        className="px-3 py-1 bg-red-50 text-red-600 rounded-lg text-xs font-medium hover:bg-red-100 disabled:opacity-50"
                      >
                        حذف از بخش
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* جستجو و افزودن خبر */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 h-fit lg:sticky lg:top-6">
              <h3 className="text-sm font-bold text-[#1B365D] mb-3">افزودن خبر به «{regionName(activeRegion)}»</h3>
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="جستجوی عنوان خبر..."
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#C9A96E] focus:ring-1 focus:ring-[#C9A96E] mb-3"
              />

              {searchLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin w-6 h-6 border-4 border-[#C9A96E] border-t-transparent rounded-full mx-auto" />
                </div>
              ) : searchResults.length > 0 ? (
                <div className="space-y-2">
                  {searchResults.map(item => (
                    <div key={item.id} className="border border-gray-100 rounded-xl p-3 bg-gray-50 flex items-center gap-2">
                      <p className="flex-1 text-xs font-medium text-gray-700 line-clamp-2">{item.title}</p>
                      <button
                        onClick={() => assignNews(item.id, activeRegion, item._type || 'external')}
                        disabled={saving}
                        className="shrink-0 px-3 py-1.5 bg-[#1B365D] text-white rounded-lg text-xs font-bold hover:bg-[#2a4a7a] disabled:opacity-50"
                      >
                        افزودن
                      </button>
                    </div>
                  ))}
                </div>
              ) : search.trim() ? (
                <p className="text-xs text-gray-400 text-center py-6">خبری یافت نشد</p>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
