'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ImageCropper from '@/components/admin/ImageCropper';

const PAPERS = [
  'همشهری', 'اطلاعات', 'کیهان', 'جام جم', 'جوان', 'شرق', 'اعتماد', 'ایران',
  'خراسان', 'قدس', 'جمهوری اسلامی', 'دنیای اقتصاد', 'رسالت', 'خبر ورزشی',
  'طرفداری', 'فرهیختگان', 'هم‌میهن', 'وطن امروز', 'آرمان ملی', 'سازندگی',
];

const todayKey = () => {
  const d = new Date(Date.now() - new Date().getTimezoneOffset() * 60000);
  return d.toISOString().slice(0, 10);
};

interface CoverItem {
  paper: string;
  image: string;
}

export default function FrontpagesPage() {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const router = useRouter();
  const [date, setDate] = useState(todayKey());
  const [items, setItems] = useState<CoverItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [paper, setPaper] = useState(PAPERS[0]);
  const [customPaper, setCustomPaper] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [cropSrc, setCropSrc] = useState<{ url: string; name: string } | null>(null);

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isAdmin)) router.push('/secure-a2x-admin');
  }, [isAuthenticated, isAdmin, isLoading, router]);

  useEffect(() => {
    if (isAuthenticated && isAdmin) fetchItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isAdmin, date]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/frontpages?date=${date}`);
      const data = await res.json();
      if (data.success) setItems(data.data);
    } catch {}
    finally { setLoading(false); }
  };

  const paperName = () => (paper === 'سایر' ? customPaper.trim() : paper);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!paperName()) {
      alert('اول نام روزنامه را انتخاب کنید');
      e.target.value = '';
      return;
    }
    setCropSrc({ url: URL.createObjectURL(file), name: file.name });
    e.target.value = '';
  };

  const handleCropDone = async (blob: Blob) => {
    if (!cropSrc) return;
    const objUrl = cropSrc.url;
    const name = paperName();
    setCropSrc(null);
    if (!name) return;
    setUploading(true);
    try {
      const croppedFile = new File([blob], cropSrc.name, { type: blob.type });
      const formData = new FormData();
      formData.append('file', croppedFile);
      const upRes = await fetch('/api/admin/upload', { method: 'POST', body: formData });
      const upData = await upRes.json();
      if (!upData.success) {
        alert(upData.message || 'خطا در آپلود عکس');
        return;
      }
      setSaving(true);
      const res = await fetch('/api/admin/frontpages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, paper: name, image: upData.data.url }),
      });
      const data = await res.json();
      if (data.success) {
        alert(`جلد ${name} ثبت شد`);
        fetchItems();
      } else {
        alert(data.message || 'خطا در ذخیره جلد');
      }
    } catch {
      alert('خطا در ذخیره جلد');
    } finally {
      setUploading(false);
      setSaving(false);
      URL.revokeObjectURL(objUrl);
    }
  };

  const handleDelete = async (p: string) => {
    if (!confirm(`جلد ${p} حذف شود؟`)) return;
    try {
      const res = await fetch('/api/admin/frontpages', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, paper: p }),
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
            <h1 className="text-xl font-bold">جلد روزنامه‌ها</h1>
          </div>
          <Link href="/kiosk" target="_blank" className="px-4 py-2 bg-[#C9A96E] text-[#1B365D] rounded-lg font-bold hover:bg-[#d4b87a] transition-colors text-sm">
            مشاهده صفحه
          </Link>
        </div>
      </div>

      <div className="site-container py-8 max-w-4xl">
        {/* افزودن جلد */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">تاریخ</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#C9A96E]" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">روزنامه</label>
              <select value={paper} onChange={e => setPaper(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#C9A96E] bg-white">
                {PAPERS.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
                <option value="سایر">سایر...</option>
              </select>
            </div>
            {paper === 'سایر' ? (
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">نام روزنامه</label>
                <input type="text" value={customPaper} onChange={e => setCustomPaper(e.target.value)} placeholder="نام روزنامه" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#C9A96E]" />
              </div>
            ) : (
              <div className="flex items-end">
                <label className="w-full px-4 py-3 bg-[#1B365D] text-white rounded-lg font-bold hover:bg-[#0f2d52] transition-colors text-center cursor-pointer">
                  {uploading || saving ? 'در حال ذخیره...' : 'انتخاب عکس جلد'}
                  <input type="file" accept="image/*" onChange={handleFile} className="hidden" disabled={uploading || saving} />
                </label>
              </div>
            )}
          </div>
          {paper === 'سایر' && (
            <label className="block w-full px-4 py-3 bg-[#1B365D] text-white rounded-lg font-bold hover:bg-[#0f2d52] transition-colors text-center cursor-pointer">
              {uploading || saving ? 'در حال ذخیره...' : 'انتخاب عکس جلد'}
              <input type="file" accept="image/*" onChange={handleFile} className="hidden" disabled={uploading || saving} />
            </label>
          )}
          <p className="text-xs text-gray-400 mt-3 leading-6">بعد از انتخاب عکس می‌توانید کادرش کنید. جلدهای قدیمی‌تر از ۷ روز خودکار پاک می‌شوند.</p>
        </div>

        {/* لیست جلدها */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 font-bold text-[#1B365D]">جلدهای ثبت شده ({items.length})</div>
          {loading ? (
            <div className="p-8 text-center text-gray-500">در حال بارگذاری...</div>
          ) : items.length === 0 ? (
            <div className="p-8 text-center text-gray-500">برای این تاریخ جلدی ثبت نشده است</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-6">
              {items.map(item => (
                <div key={item.paper} className="border border-gray-100 rounded-xl overflow-hidden">
                  <div className="relative w-full bg-gray-100" style={{ aspectRatio: '3 / 4' }}>
                    <img src={item.image} alt={item.paper} className="absolute inset-0 w-full h-full object-cover" />
                  </div>
                  <div className="p-2 flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-gray-700 truncate">{item.paper}</span>
                    <button onClick={() => handleDelete(item.paper)} className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-bold hover:bg-red-200 shrink-0">حذف</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {cropSrc && (
        <ImageCropper
          imageSrc={cropSrc.url}
          fileName={cropSrc.name}
          defaultAspect="free"
          outputWidth={900}
          quality={75}
          format="jpeg"
          onDone={handleCropDone}
          onCancel={() => { URL.revokeObjectURL(cropSrc.url); setCropSrc(null); }}
        />
      )}
    </div>
  );
}
