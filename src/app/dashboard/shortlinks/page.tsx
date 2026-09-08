'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface ShortItem {
  code: string;
  url: string;
  clicks: number;
  updatedAt: string;
}

export default function ShortLinksPage() {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<ShortItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [longUrl, setLongUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState('');
  const [copied, setCopied] = useState('');

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isAdmin)) router.push('/secure-a2x-admin');
  }, [isAuthenticated, isAdmin, isLoading, router]);

  useEffect(() => {
    if (isAuthenticated && isAdmin) fetchItems();
  }, [isAuthenticated, isAdmin]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/shortlinks');
      const data = await res.json();
      if (data.success) setItems(data.data);
    } catch {}
    finally { setLoading(false); }
  };

  const shortUrlOf = (code: string) => `${window.location.origin}/s/${code}`;

  const copyText = async (text: string, code: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopied(code);
    setTimeout(() => setCopied(''), 2000);
  };

  const handleCreate = async () => {
    const url = longUrl.trim();
    if (!url) {
      alert('اول لینک بلند را وارد کنید');
      return;
    }
    setSaving(true);
    setResult('');
    try {
      const res = await fetch('/api/admin/shortlinks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (data.success) {
        const short = shortUrlOf(data.data.code);
        setResult(short);
        copyText(short, 'new');
        setLongUrl('');
        fetchItems();
      } else {
        alert(data.message || 'خطا در ساخت لینک');
      }
    } catch {
      alert('خطا در ساخت لینک');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (code: string) => {
    if (!confirm(`لینک کوتاه /s/${code} حذف شود؟`)) return;
    try {
      const res = await fetch('/api/admin/shortlinks', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (data.success) fetchItems();
      else alert(data.message || 'خطا در حذف');
    } catch {
      alert('خطا در حذف');
    }
  };

  if (isLoading || !isAuthenticated || !isAdmin) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-[#C9A96E] border-t-transparent rounded-full" /></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#1B365D] text-white py-4">
        <div className="site-container flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-[#C9A96E] hover:text-white transition-colors">← بازگشت</Link>
            <h1 className="text-xl font-bold">کوتاه‌کننده لینک</h1>
          </div>
        </div>
      </div>

      <div className="site-container py-8 max-w-3xl">
        {/* ساخت */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200 mb-6">
          <label className="block text-sm font-bold text-gray-700 mb-2">لینک بلند خبر</label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={longUrl}
              onChange={e => setLongUrl(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleCreate(); }}
              placeholder="مثلاً: /news/... یا https://..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#C9A96E] text-sm"
              dir="ltr"
            />
            <button onClick={handleCreate} disabled={saving} className="px-6 py-3 bg-[#C9A96E] text-[#1B365D] rounded-lg font-bold hover:bg-[#d4b87a] transition-colors disabled:opacity-50 whitespace-nowrap">
              {saving ? '...' : 'کوتاه کن'}
            </button>
          </div>
          {result && (
            <button onClick={() => copyText(result, 'new')} className="mt-3 w-full px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 font-bold text-sm hover:bg-emerald-100 transition-colors" dir="ltr">
              {result} — {copied === 'new' ? 'کپی شد!' : 'کلیک برای کپی'}
            </button>
          )}
        </div>

        {/* لیست */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 font-bold text-[#1B365D]">لینک‌های ساخته شده ({items.length})</div>
          {loading ? (
            <div className="p-8 text-center text-gray-500">در حال بارگذاری...</div>
          ) : items.length === 0 ? (
            <div className="p-8 text-center text-gray-500">هنوز لینکی ساخته نشده است</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {items.map(item => (
                <div key={item.code} className="px-6 py-4 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <button onClick={() => copyText(shortUrlOf(item.code), item.code)} className="font-bold text-[#1B365D] hover:text-[#C9A96E] text-sm" dir="ltr">
                      /s/{item.code} {copied === item.code ? '— کپی شد!' : ''}
                    </button>
                    <p className="text-xs text-gray-400 truncate mt-1" dir="ltr">{item.url}</p>
                  </div>
                  <span className="text-xs text-gray-500 whitespace-nowrap">{item.clicks} بازدید</span>
                  <button onClick={() => handleDelete(item.code)} className="px-3 py-1 bg-red-100 text-red-700 rounded text-xs font-bold hover:bg-red-200 transition-colors">حذف</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
