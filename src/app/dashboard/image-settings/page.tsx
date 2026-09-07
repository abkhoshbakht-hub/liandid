'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const DEFAULTS = {
  image_max_mb: '4',
  image_quality: '80',
  image_max_dim: '1280',
  image_aspect: '16:9',
  image_format: 'jpeg',
};

const ASPECTS = [
  { value: '16:9', label: '۱۶:۹ (پهن — مناسب هیرو و کارت خبر)' },
  { value: '4:3', label: '۴:۳ (کلاسیک)' },
  { value: '1:1', label: '۱:۱ (مربع)' },
  { value: 'free', label: 'آزاد (بدون برش اجباری)' },
];

const FORMATS = [
  { value: 'jpeg', label: 'JPEG (سازگار با همه — پیشنهادی)' },
  { value: 'webp', label: 'WebP (کم‌حجم‌تر و مدرن)' },
  { value: 'png', label: 'PNG (کیفیت کامل، حجم بیشتر)' },
  { value: 'original', label: 'فرمت اصلی عکس (بدون تبدیل)' },
];

export default function ImageSettingsPage() {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isAdmin)) {
      router.push('/secure-a2x-admin');
    }
  }, [isAuthenticated, isAdmin, isLoading, router]);

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      fetch('/api/admin/settings')
        .then(r => r.json())
        .then(data => {
          setForm({
            image_max_mb: data.image_max_mb || DEFAULTS.image_max_mb,
            image_quality: data.image_quality || DEFAULTS.image_quality,
            image_max_dim: data.image_max_dim || DEFAULTS.image_max_dim,
            image_aspect: data.image_aspect || DEFAULTS.image_aspect,
            image_format: data.image_format || DEFAULTS.image_format,
          });
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [isAuthenticated, isAdmin]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        alert('تنظیمات عکس ذخیره شد');
      } else {
        alert('خطا در ذخیره تنظیمات');
      }
    } catch {
      alert('خطا در ذخیره تنظیمات');
    } finally {
      setSaving(false);
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
            <h1 className="text-xl font-bold">تنظیم عکس</h1>
          </div>
          <button onClick={handleSave} disabled={saving} className="px-6 py-2 bg-[#C9A96E] text-[#1B365D] rounded-lg font-bold hover:bg-[#d4b87a] transition-colors disabled:opacity-50">
            {saving ? 'در حال ذخیره...' : 'ذخیره تنظیمات'}
          </button>
        </div>
      </div>

      <div className="site-container py-8 max-w-3xl">
        {loading ? (
          <div className="p-8 text-center text-gray-500">در حال بارگذاری...</div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200 space-y-8">
            <p className="text-sm text-gray-500 leading-7 text-justify">
              این تنظیمات روی همه عکس‌های خبری (عکس شاخص خبر، ارسال مخاطبین و گالری) اعمال می‌شود. عکس‌ها به‌صورت خودکار فشرده و به فرمت انتخابی تبدیل می‌شوند تا سایت سریع بماند.
            </p>

            {/* حداکثر حجم */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                حداکثر حجم عکس: <span className="text-[#1B365D]">{form.image_max_mb} مگابایت</span>
              </label>
              <input
                type="range" min={1} max={10} step={0.5}
                value={form.image_max_mb}
                onChange={e => setForm({ ...form, image_max_mb: e.target.value })}
                className="w-full accent-[#C9A96E]"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>۱۰ مگ</span><span>۱ مگ</span>
              </div>
            </div>

            {/* کیفیت */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                کیفیت فشرده‌سازی: <span className="text-[#1B365D]">{form.image_quality}٪</span>
              </label>
              <input
                type="range" min={10} max={100} step={5}
                value={form.image_quality}
                onChange={e => setForm({ ...form, image_quality: e.target.value })}
                className="w-full accent-[#C9A96E]"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>۱۰۰ (بهترین کیفیت)</span><span>۱۰ (کمترین حجم)</span>
              </div>
            </div>

            {/* حداکثر ابعاد */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">حداکثر عرض یا ارتفاع عکس (پیکسل)</label>
              <select
                value={form.image_max_dim}
                onChange={e => setForm({ ...form, image_max_dim: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#C9A96E] bg-white"
              >
                <option value="800">۸۰۰ پیکسل (سبک — مناسب موبایل)</option>
                <option value="1280">۱۲۸۰ پیکسل (استاندارد — پیشنهادی)</option>
                <option value="1920">۱۹۲۰ پیکسل (بزرگ — مناسب هیرو تمام‌صفحه)</option>
              </select>
            </div>

            {/* نسبت برش */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">قاب برش پیش‌فرض عکس شاخص</label>
              <select
                value={form.image_aspect}
                onChange={e => setForm({ ...form, image_aspect: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#C9A96E] bg-white"
              >
                {ASPECTS.map(a => (
                  <option key={a.value} value={a.value}>{a.label}</option>
                ))}
              </select>
            </div>

            {/* فرمت خروجی */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">فرمت تبدیل عکس</label>
              <select
                value={form.image_format}
                onChange={e => setForm({ ...form, image_format: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#C9A96E] bg-white"
              >
                {FORMATS.map(f => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </select>
              <p className="text-xs text-gray-400 mt-2 leading-6 text-justify">
                هر عکسی با هر فرمتی آپلود شود، به‌صورت خودکار به این فرمت تبدیل می‌شود.
              </p>
            </div>

            <button onClick={handleSave} disabled={saving} className="w-full px-4 py-3 bg-[#1B365D] text-white rounded-lg font-bold hover:bg-[#0f2d52] transition-colors disabled:opacity-50">
              {saving ? 'در حال ذخیره...' : 'ذخیره تنظیمات'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
