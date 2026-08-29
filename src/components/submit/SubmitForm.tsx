'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';

const categories = [
  { value: 'havades', label: 'حوادث' },
  { value: 'eghtesadi', label: 'اقتصادی' },
  { value: 'ejtemaei', label: 'اجتماعی' },
  { value: 'siyasi', label: 'سیاسی' },
  { value: 'varzeshi', label: 'ورزشی' },
  { value: 'farhangi', label: 'فرهنگی' },
  { value: 'fanavari', label: 'فناوری' },
  { value: 'elmi', label: 'علمی' },
  { value: 'bushahr', label: 'بوشهر' },
  { value: 'other', label: 'سایر' },
];

export default function SubmitForm() {
  const [form, setForm] = useState({
    title: '',
    content: '',
    category: '',
    mediaType: 'TEXT',
    senderName: '',
    senderPhone: '',
    senderEmail: '',
  });
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      if (f.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (ev) => setPreview(ev.target?.result as string);
        reader.readAsDataURL(f);
      } else {
        setPreview(null);
      }
      if (f.type.startsWith('video/')) {
        setForm({ ...form, mediaType: 'VIDEO' });
      } else if (f.type.startsWith('image/')) {
        setForm({ ...form, mediaType: 'PHOTO' });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('content', form.content);
      formData.append('category', form.category);
      formData.append('mediaType', form.mediaType);
      formData.append('senderName', form.senderName);
      formData.append('senderPhone', form.senderPhone);
      formData.append('senderEmail', form.senderEmail);
      if (file) formData.append('file', file);

      const res = await fetch('/api/submit', { method: 'POST', body: formData });
      const data = await res.json();

      if (data.success) {
        setSuccess(data.message);
        setForm({ title: '', content: '', category: '', mediaType: 'TEXT', senderName: '', senderPhone: '', senderEmail: '' });
        setFile(null);
        setPreview(null);
        if (fileRef.current) fileRef.current.value = '';
      } else {
        setError(data.error || 'خطا در ارسال');
      }
    } catch {
      setError('خطا در اتصال به سرور');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="site-container max-w-3xl">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#1B365D] mb-6 transition-colors">
          <svg className="w-4 h-4 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          بازگشت به صفحه اصلی
        </Link>

        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 bg-gradient-to-l from-[#1B365D] to-[#2a4a7a] text-white px-6 py-3 rounded-2xl mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <h1 className="text-2xl font-black">ارسال خبر توسط مخاطبین</h1>
          </div>
          <p className="text-gray-600 text-sm">اخبار، عکس‌ها و فیلم‌های خود را برای ما ارسال کنید</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          {success && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {success}
            </div>
          )}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-2">عنوان خبر *</label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#C9A96E] focus:ring-2 focus:ring-[#C9A96E]/10"
                placeholder="عنوان خبر را وارد کنید"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">دسته‌بندی *</label>
              <select
                required
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#C9A96E] focus:ring-2 focus:ring-[#C9A96E]/10 bg-white"
              >
                <option value="">انتخاب کنید</option>
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">نوع رسانه</label>
              <div className="flex gap-3">
                {[
                  { value: 'TEXT', label: 'متنی', icon: '📝' },
                  { value: 'PHOTO', label: 'عکس', icon: '📷' },
                  { value: 'VIDEO', label: 'فیلم', icon: '🎬' },
                ].map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setForm({ ...form, mediaType: type.value })}
                    className={`flex-1 py-3 rounded-xl text-sm font-bold border-2 transition-all ${
                      form.mediaType === type.value
                        ? 'border-[#1B365D] bg-[#1B365D] text-white'
                        : 'border-gray-200 text-gray-600 hover:border-[#C9A96E]'
                    }`}
                  >
                    <span className="text-lg">{type.icon}</span>
                    <span className="block text-xs mt-1">{type.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-2">متن خبر *</label>
              <textarea
                required
                rows={5}
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#C9A96E] focus:ring-2 focus:ring-[#C9A96E]/10 resize-none"
                placeholder="متن خبر را بنویسید..."
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-2">آپلود عکس یا فیلم</label>
              <div
                onClick={() => fileRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-[#C9A96E] hover:bg-[#C9A96E]/5 transition-all"
              >
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                {preview ? (
                  <img src={preview} alt="پیش‌نمایش" className="max-h-48 mx-auto rounded-lg" />
                ) : file ? (
                  <div className="text-gray-600">
                    <svg className="w-10 h-10 mx-auto mb-2 text-[#1B365D]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    <p className="text-sm">{file.name}</p>
                  </div>
                ) : (
                  <div className="text-gray-400">
                    <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    <p className="text-sm">کلیک کنید یا فایل را بکشید</p>
                    <p className="text-xs text-gray-400 mt-1">عکس: JPG, PNG - فیلم: MP4, MOV</p>
                  </div>
                )}
              </div>
            </div>

            <div className="md:col-span-2 pt-4 border-t border-gray-100">
              <h3 className="text-sm font-bold text-gray-700 mb-4">اطلاعات فرستنده</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">نام و نام خانوادگی *</label>
                  <input
                    type="text"
                    required
                    value={form.senderName}
                    onChange={(e) => setForm({ ...form, senderName: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#C9A96E]"
                    placeholder="نام شما"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">تلفن تماس</label>
                  <input
                    type="tel"
                    value={form.senderPhone}
                    onChange={(e) => setForm({ ...form, senderPhone: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#C9A96E]"
                    placeholder="0912..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">ایمیل</label>
                  <input
                    type="email"
                    value={form.senderEmail}
                    onChange={(e) => setForm({ ...form, senderEmail: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#C9A96E]"
                    placeholder="email@example.com"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-between">
            <p className="text-xs text-gray-400">فیلدهای ستاره‌دار الزامی هستند</p>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-gradient-to-l from-[#1B365D] to-[#2a4a7a] text-white rounded-xl font-bold text-sm hover:from-[#2a4a7a] hover:to-[#1B365D] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  در حال ارسال...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                  ارسال خبر
                </>
              )}
            </button>
          </div>
        </form>

        <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-bold text-[#1B365D] mb-3 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            راهنما
          </h3>
          <ul className="text-sm text-gray-600 space-y-2">
            <li className="flex items-start gap-2"><span className="text-[#C9A96E] mt-1">•</span> اخبار، عکس‌ها و فیلم‌های مربوط به استان بوشهر در اولویت بررسی قرار می‌گیرند</li>
            <li className="flex items-start gap-2"><span className="text-[#C9A96E] mt-1">•</span> پس از بررسی توسط تیم تحریریه، خبر منتشر خواهد شد</li>
            <li className="flex items-start gap-2"><span className="text-[#C9A96E] mt-1">•</span> حتماً اطلاعات تماس صحیح وارد کنید تا در صورت نیاز با شما تماس بگیریم</li>
            <li className="flex items-start gap-2"><span className="text-[#C9A96E] mt-1">•</span> از ارسال محتوای تکراری خودداری کنید</li>
          </ul>
        </div>
      </div>
    </div>
  );
}