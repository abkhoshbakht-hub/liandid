'use client';

import { useState, useEffect } from 'react';

interface StaticPage {
  id: string;
  slug: string;
  title: string;
  content: string;
  excerpt: string;
  featuredImage: string;
  authorName: string;
  authorImage: string;
}

function textToHtml(text: string): string {
  return text
    .split('\n\n')
    .filter(p => p.trim())
    .map(p => `<p>${p.replace(/\n/g, '<br/>')}</p>`)
    .join('\n');
}

function htmlToText(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<div[^>]*>/gi, '\n')
    .replace(/<\/div>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export default function StaticPagesPage() {
  const [pages, setPages] = useState<StaticPage[]>([]);
  const [selected, setSelected] = useState<string>('');
  const [form, setForm] = useState({ slug: '', title: '', content: '', excerpt: '', featuredImage: '', authorName: '', authorImage: '' });
  const [rawText, setRawText] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [mode, setMode] = useState<'text' | 'html'>('text');

  useEffect(() => {
    fetch('/api/admin/static-pages').then(r => r.json()).then(d => { if (d.success) setPages(d.data); }).catch(() => {});
  }, []);

  useEffect(() => {
    if (selected) {
      fetch(`/api/admin/static-pages?slug=${selected}`).then(r => r.json()).then(d => {
        if (d.success && d.data) {
          setForm({
            slug: d.data.slug, title: d.data.title, content: d.data.content,
            excerpt: d.data.excerpt || '', featuredImage: d.data.featuredImage || '',
            authorName: d.data.authorName || '', authorImage: d.data.authorImage || '',
          });
          setRawText(htmlToText(d.data.content));
        }
      }).catch(() => {});
    }
  }, [selected]);

  const handleSave = async () => {
    const contentToSave = mode === 'text' ? textToHtml(rawText) : form.content;
    setSaving(true);
    try {
      const r = await fetch('/api/admin/static-pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, content: contentToSave }),
      });
      const d = await r.json();
      if (d.success) {
        setForm({ ...form, content: contentToSave });
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
        if (!pages.find(p => p.slug === form.slug)) {
          setPages([...pages, d.data]);
        }
      }
    } catch { console.error(); }
    setSaving(false);
  };

  const loadTemplate = () => {
    setRawText(`بسمه تعالی

دوستان عزیز و همراهان گرامی، سلام

متن خود را اینجا بنویسید...

هر پاراگراف با یک خط خالی جدا می‌شود.

در پایان:

نام و نام خانوادگی
سمت و عنوان`);
    setMode('text');
  };

  return (
    <div className="max-w-4xl" dir="rtl">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-[#0a1628]">صفحات ایستا</h1>
        <p className="text-sm text-gray-400 mt-1">مقاله‌ها و صفحات ثابت سایت را از اینجا ویرایش کنید</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
        <h2 className="text-sm font-black text-[#1B365D] mb-4">انتخاب صفحه</h2>
        <div className="flex gap-3">
          <select
            value={selected}
            onChange={e => { setSelected(e.target.value); setForm({ slug: e.target.value, title: '', content: '', excerpt: '', featuredImage: '', authorName: '', authorImage: '' }); setRawText(''); }}
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#C9A96E]"
          >
            <option value="">انتخاب کنید...</option>
            {pages.map(p => (
              <option key={p.slug} value={p.slug}>{p.title}</option>
            ))}
          </select>
          <button
            onClick={() => { setSelected(''); setForm({ slug: 'launch', title: 'پیام مدیر مسئول', content: '', excerpt: '', featuredImage: '/Alipour.jpg', authorName: 'محمدمهدی علیپور', authorImage: '/Alipour.jpg' }); setRawText(''); }}
            className="px-4 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-sm font-bold hover:bg-gray-200 transition-colors"
          >
            صفحه جدید
          </button>
        </div>
      </div>

      {form.slug && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="text-sm font-black text-[#1B365D] mb-4">اطلاعات پایه</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">شناسه (slug)</label>
                <input type="text" value={form.slug} onChange={e => setForm({...form, slug: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#C9A96E]" dir="ltr" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">عنوان صفحه</label>
                <input type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#C9A96E]" />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-xs text-gray-400 mb-1">خلاصه</label>
              <input type="text" value={form.excerpt} onChange={e => setForm({...form, excerpt: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#C9A96E]" />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="text-sm font-black text-[#1B365D] mb-4">نویسنده</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">نام نویسنده</label>
                <input type="text" value={form.authorName} onChange={e => setForm({...form, authorName: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#C9A96E]" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">آدرس عکس نویسنده</label>
                <input type="text" value={form.authorImage} onChange={e => setForm({...form, authorImage: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#C9A96E]" dir="ltr" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-black text-[#1B365D]">متن مقاله</h2>
              <div className="flex gap-2">
                <button onClick={loadTemplate} className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs font-bold hover:bg-gray-200 transition-colors">
                  الگو
                </button>
                <button onClick={() => setShowPreview(!showPreview)} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${showPreview ? 'bg-[#1B365D] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  {showPreview ? 'پنهان' : 'پیش‌نمایش'}
                </button>
                <button onClick={() => setMode(mode === 'text' ? 'html' : 'text')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${mode === 'html' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                  {mode === 'text' ? 'متن ساده' : 'HTML'}
                </button>
              </div>
            </div>
            <p className="text-xs text-gray-400 mb-3">
              {mode === 'text'
                ? 'متن ساده بنویسید. هر پاراگراف را با یک خط خالی جدا کنید. خودکار تبدیل به HTML می‌شود.'
                : 'محتوای HTML را وارد کنید.'}
            </p>
            {mode === 'text' ? (
              <textarea
                value={rawText}
                onChange={e => setRawText(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#C9A96E] h-[400px] leading-relaxed"
                dir="rtl"
                placeholder="متن مقاله را اینجا بنویسید...&#10;&#10;هر پاراگراف را با یک خط خالی جدا کنید."
              />
            ) : (
              <textarea
                value={form.content}
                onChange={e => setForm({...form, content: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#C9A96E] h-[400px] font-mono text-left"
                dir="ltr"
                placeholder="محتوای HTML..."
              />
            )}
            {showPreview && (
              <div className="mt-4 p-6 bg-gray-50 rounded-xl border border-gray-200">
                <h3 className="text-xs font-bold text-gray-500 mb-3">پیش‌نمایش:</h3>
                <div
                  className="prose prose-lg max-w-none text-gray-700 leading-[2.2] text-justify"
                  dangerouslySetInnerHTML={{ __html: mode === 'text' ? textToHtml(rawText) : form.content }}
                />
              </div>
            )}
          </div>

          <button onClick={handleSave} disabled={saving} className="px-6 py-2.5 rounded-xl bg-[#1B365D] text-white text-sm font-bold hover:bg-[#0f2440] transition-colors disabled:opacity-50">
            {saving ? 'در حال ذخیره...' : saved ? 'ذخیره شد' : 'ذخیره تغییرات'}
          </button>
        </div>
      )}
    </div>
  );
}
