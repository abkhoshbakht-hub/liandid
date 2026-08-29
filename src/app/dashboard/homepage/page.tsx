'use client';

import { useState, useEffect, Suspense } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface Slot {
  id: string;
  slotKey: string;
  label: string;
  type: string;
  externalNewsId: string | null;
  customTitle: string | null;
  customContent: string | null;
  customImage: string | null;
  customLink: string | null;
  category: string | null;
  isActive: boolean;
  externalNews: { id: string; title: string; sourceName: string; category: string | null; image: string | null; publishedAt: string | null } | null;
}

interface NewsItem {
  id: string;
  title: string;
  sourceName: string;
  category: string | null;
  image: string | null;
  publishedAt: string | null;
  description: string | null;
}

export default function HomepageSlotsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-[#C9A96E] border-t-transparent rounded-full" /></div>}>
      <HomepageContent />
    </Suspense>
  );
}

function HomepageContent() {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeSection = searchParams.get('section');
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSlot, setEditingSlot] = useState<Slot | null>(null);
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const [modalTab, setModalTab] = useState<'archive' | 'custom'>('archive');

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isAdmin)) router.push('/secure-a2x-admin');
  }, [isAuthenticated, isAdmin, isLoading, router]);

  useEffect(() => {
    if (isAuthenticated && isAdmin) fetchSlots();
  }, [isAuthenticated, isAdmin]);

  useEffect(() => {
    if (activeSection && slots.length > 0) {
      setTimeout(() => {
        document.getElementById('section-' + activeSection)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    }
  }, [activeSection, slots]);

  const fetchSlots = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/homepage');
      const data = await res.json();
      if (data.success) setSlots(data.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const fetchNews = async (q: string) => {
    try {
      const params = new URLSearchParams();
      if (q) params.set('search', q);
      const res = await fetch(`/api/admin/homepage/news?${params}`);
      const data = await res.json();
      if (data.success) setNewsList(data.data);
    } catch (e) { console.error(e); }
  };

  const handleSelectNews = async (slotId: string, newsId: string) => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/homepage', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: slotId, type: 'EXTERNAL', externalNewsId: newsId }),
      });
      const data = await res.json();
      if (data.success) { fetchSlots(); setEditingSlot(null); }
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const handleSetCustom = async (slotId: string, title: string, content: string, image: string, link: string) => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/homepage', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: slotId, type: 'CUSTOM',
          customTitle: title, customContent: content, customImage: image, customLink: link,
        }),
      });
      const data = await res.json();
      if (data.success) { fetchSlots(); setEditingSlot(null); }
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const handleClear = async (slotId: string) => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/homepage', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: slotId, type: 'EXTERNAL', externalNewsId: null, customTitle: null, customContent: null, customImage: null, customLink: null }),
      });
      const data = await res.json();
      if (data.success) fetchSlots();
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const formatDate = (d: string | null) => {
    if (!d) return '';
    try { return new Date(d).toLocaleDateString('fa-IR'); } catch { return ''; }
  };

  const grouped = slots.reduce((acc, s) => {
    const section = s.slotKey.split('-')[0];
    if (!acc[section]) acc[section] = [];
    acc[section].push(s);
    return acc;
  }, {} as Record<string, Slot[]>);

  const sectionLabels: Record<string, string> = {
    hero: 'بخش ویژه (Hero)',
    breaking: 'اخبار فوری',
    latest: 'آخرین اخبار',
    analysis: 'تحلیل‌ها',
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
            <h1 className="text-xl font-bold">مدیریت باکس‌های صفحه اصلی</h1>
          </div>
        </div>
      </div>

      <div className="site-container py-6">
        {loading ? (
          <div className="text-center py-20"><div className="animate-spin w-8 h-8 border-4 border-[#C9A96E] border-t-transparent rounded-full mx-auto" /></div>
        ) : (
          <div className="space-y-8">
            {Object.entries(grouped).map(([section, items]) => (
              <div key={section} id={'section-' + section} className={`rounded-2xl p-4 transition-all ${activeSection === section ? 'bg-[#C9A96E]/10 border-2 border-[#C9A96E]' : ''}`}>
                <h2 className="text-lg font-bold text-[#1B365D] mb-4 flex items-center gap-2">
                  <span className="w-1 h-6 bg-[#C9A96E] rounded-full" />
                  {sectionLabels[section] || section}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {items.map(slot => (
                    <div key={slot.id} className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded">{slot.slotKey}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${slot.type === 'CUSTOM' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                          {slot.type === 'CUSTOM' ? 'ویرایش' : 'خبرگزاری'}
                        </span>
                      </div>

                      {slot.type === 'CUSTOM' && slot.customTitle ? (
                        <div className="mb-3">
                          <p className="text-sm font-bold text-gray-800 line-clamp-2">{slot.customTitle}</p>
                          {slot.customContent && <p className="text-xs text-gray-400 mt-1 line-clamp-2">{slot.customContent}</p>}
                          <span className="text-[10px] text-purple-500 mt-1 block">خبر ویرایش لیان دید</span>
                        </div>
                      ) : slot.externalNews ? (
                        <div className="mb-3">
                          <p className="text-sm font-bold text-gray-800 line-clamp-2">{slot.externalNews.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{slot.externalNews.sourceName}</span>
                            <span className="text-[10px] text-gray-400">{formatDate(slot.externalNews.publishedAt)}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="mb-3 py-6 text-center text-gray-300 text-sm">
                          خبری انتخاب نشده
                        </div>
                      )}

                      <div className="flex gap-2">
                        <button
                          onClick={() => { setEditingSlot(slot); setModalTab('archive'); fetchNews(''); }}
                          className="flex-1 px-3 py-2 bg-[#1B365D] text-white text-xs font-medium rounded-lg hover:bg-[#2a4a7a] transition-colors"
                        >
                          ویرایش
                        </button>
                        {(slot.externalNewsId || slot.customTitle) && (
                          <button
                            onClick={() => handleClear(slot.id)}
                            className="px-3 py-2 bg-red-50 text-red-600 text-xs font-medium rounded-lg hover:bg-red-100 transition-colors"
                          >
                            حذف
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {editingSlot && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setEditingSlot(null)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-[#1B365D]">ویرایش باکس: {editingSlot.label}</h3>
                <button onClick={() => setEditingSlot(null)} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setModalTab('archive')}
                  className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors ${modalTab === 'archive' ? 'bg-[#1B365D] text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                >
                  انتخاب از آرشیو اخبار
                </button>
                <button
                  onClick={() => setModalTab('custom')}
                  className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors ${modalTab === 'custom' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                >
                  نوشتن خبر اختصاصی
                </button>
              </div>
            </div>

            {modalTab === 'archive' ? (
              <div className="p-6">
                <input
                  type="text"
                  placeholder="جستجوی خبر..."
                  value={search}
                  onChange={e => { setSearch(e.target.value); fetchNews(e.target.value); }}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm mb-4 focus:outline-none focus:border-[#C9A96E]"
                  autoFocus
                />
                <div className="space-y-2 max-h-[50vh] overflow-y-auto">
                  {newsList.length === 0 ? (
                    <p className="text-center text-gray-400 py-8">خبری یافت نشد</p>
                  ) : (
                    newsList.map(news => (
                      <button
                        key={news.id}
                        onClick={() => handleSelectNews(editingSlot.id, news.id)}
                        disabled={saving}
                        className="w-full text-right p-4 bg-gray-50 hover:bg-[#1B365D]/5 border border-gray-100 hover:border-[#C9A96E]/30 rounded-xl transition-all disabled:opacity-50"
                      >
                        <p className="text-sm font-bold text-gray-800 line-clamp-1">{news.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{news.sourceName}</span>
                          {news.category && <span className="text-[10px] text-gray-400">{news.category}</span>}
                          <span className="text-[10px] text-gray-400">{formatDate(news.publishedAt)}</span>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            ) : (
              <CustomNewsForm
                slot={editingSlot}
                onSave={(title, content, image, link) => handleSetCustom(editingSlot.id, title, content, image, link)}
                saving={saving}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function CustomNewsForm({ slot, onSave, saving }: { slot: Slot; onSave: (t: string, c: string, i: string, l: string) => void; saving: boolean }) {
  const [title, setTitle] = useState(slot.customTitle || '');
  const [content, setContent] = useState(slot.customContent || '');
  const [image, setImage] = useState(slot.customImage || '');
  const [link, setLink] = useState(slot.customLink || '');

  return (
    <div className="p-6 space-y-4">
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-1">عنوان خبر</label>
        <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#C9A96E]" placeholder="عنوان خبر ویرایش..." />
      </div>
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-1">متن خلاصه</label>
        <textarea value={content} onChange={e => setContent(e.target.value)} rows={3} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#C9A96E] resize-none" placeholder="خلاصه خبر..." />
      </div>
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-1">لینک تصویر (اختیاری)</label>
        <input type="text" value={image} onChange={e => setImage(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#C9A96E]" placeholder="https://..." />
      </div>
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-1">لینک خبر (اختیاری)</label>
        <input type="text" value={link} onChange={e => setLink(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#C9A96E]" placeholder="https://..." />
      </div>
      <button
        onClick={() => onSave(title, content, image, link)}
        disabled={saving || !title.trim()}
        className="w-full py-3 bg-gradient-to-l from-[#C9A96E] to-[#b8945d] text-white rounded-xl font-bold hover:from-[#d4b87a] hover:to-[#C9A96E] transition-all disabled:opacity-50"
      >
        {saving ? 'در حال ذخیره...' : 'ذخیره خبر ویرایش'}
      </button>
    </div>
  );
}
