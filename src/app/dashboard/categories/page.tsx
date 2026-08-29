'use client';

import { useState, useEffect, Suspense } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  color?: string;
  order: number;
  _count: { articles: number };
}

export default function CategoriesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-[#C9A96E] border-t-transparent rounded-full" /></div>}>
      <CategoriesContent />
    </Suspense>
  );
}

function CategoriesContent() {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const catSlug = searchParams.get('cat');
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState({ name: '', slug: '', icon: '', color: '#1B365D', order: 0 });

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isAdmin)) {
      router.push('/secure-a2x-admin');
    }
  }, [isAuthenticated, isAdmin, isLoading, router]);

  useEffect(() => {
    if (isAuthenticated && isAdmin) fetchCategories();
  }, [isAuthenticated, isAdmin]);

  useEffect(() => {
    if (catSlug && categories.length > 0) {
      const found = categories.find(c => c.slug === catSlug);
      if (found) openEditForm(found);
    }
  }, [catSlug, categories]);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/categories');
      const data = await res.json();
      if (data.success) setCategories(data.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const openEditForm = (cat: Category) => {
    setEditingId(cat.id);
    setForm({ name: cat.name, slug: cat.slug, icon: cat.icon || '', color: cat.color || '#1B365D', order: cat.order });
    setShowForm(true);
    setTimeout(() => {
      const el = document.getElementById('edit-form-box');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 200);
  };

  const resetForm = () => {
    setForm({ name: '', slug: '', icon: '', color: '#1B365D', order: 0 });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async () => {
    if (!form.name || !form.slug) { alert('نام و لینک الزامی است'); return; }
    try {
      const url = editingId ? `/api/admin/categories/${editingId}` : '/api/admin/categories';
      const res = await fetch(url, { method: editingId ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const data = await res.json();
      if (data.success) {
        alert(editingId ? 'به‌روزرسانی شد' : 'ایجاد شد');
        resetForm();
        fetchCategories();
      } else { alert(data.message || 'خطا'); }
    } catch (error) { console.error('Error:', error); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('آیا مطمئنید؟')) return;
    try {
      const res = await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) { alert('حذف شد'); fetchCategories(); }
      else { alert(data.message || 'خطا در حذف'); }
    } catch (error) { console.error('Error:', error); }
  };

  const autoSlug = (name: string) => name.replace(/[^a-zA-Z0-9\u0600-\u06FF\s]/g, '').replace(/\s+/g, '-').toLowerCase();

  if (isLoading || !isAuthenticated || !isAdmin) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-[#C9A96E] border-t-transparent rounded-full" /></div>;
  }

  const activeCat = catSlug ? categories.find(c => c.slug === catSlug) : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#1B365D] text-white py-4">
        <div className="site-container flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-[#C9A96E] hover:text-white transition-colors">{'\u2190'} بازگشت</Link>
            <h1 className="text-xl font-bold">{activeCat ? `${activeCat.icon || ''} مدیریت ${activeCat.name}` : 'مدیریت دسته\u200cبندی\u200cها'}</h1>
          </div>
          <button onClick={() => { resetForm(); setShowForm(true); }} className="px-4 py-2 bg-[#C9A96E] text-[#1B365D] rounded-lg font-bold hover:bg-[#d4b87a] transition-colors">
            {showForm ? 'بستن' : '+ دسته\u200cبندی جدید'}
          </button>
        </div>
      </div>

      <div className="site-container py-8">
        {activeCat && (
          <div className="bg-[#1B365D]/5 border border-[#C9A96E]/30 rounded-xl px-6 py-4 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-3 h-3 rounded-full bg-[#C9A96E]" />
              <div>
                <span className="text-sm text-gray-500">در حال ویرایش دسته:</span>
                <span className="text-sm font-bold text-[#1B365D] mr-2">{activeCat.icon} {activeCat.name}</span>
                <span className="text-xs text-gray-400 mr-2">(/{activeCat.slug})</span>
              </div>
            </div>
            <button onClick={() => router.push(`/dashboard/articles?cat=${activeCat.slug}`)} className="px-4 py-2 bg-[#C9A96E] text-[#1B365D] rounded-lg text-xs font-bold hover:bg-[#d4b87a] transition-colors">ویرایش اخبار</button>
          </div>
        )}

        <div id="edit-form-box" className="mb-6" style={{ display: showForm ? 'block' : 'none' }}>
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
            <h2 className="text-lg font-bold text-[#1B365D] mb-6">{editingId ? 'ویرایش دسته\u200cبندی' : 'دسته\u200cبندی جدید'}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">نام *</label>
                <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value, slug: autoSlug(e.target.value) })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#C9A96E]" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">لینک *</label>
                <input type="text" value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#C9A96E]" dir="ltr" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">آیکون</label>
                <input type="text" value={form.icon} onChange={e => setForm({ ...form, icon: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#C9A96E]" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">رنگ</label>
                <input type="color" value={form.color} onChange={e => setForm({ ...form, color: e.target.value })} className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">اولویت</label>
                <input type="number" value={form.order} onChange={e => setForm({ ...form, order: parseInt(e.target.value) || 0 })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#C9A96E]" />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={handleSubmit} className="px-6 py-2 bg-[#1B365D] text-white rounded-lg font-bold hover:bg-[#2E5090] transition-colors">
                {editingId ? 'ذخیره تغییرات' : 'ایجاد دسته\u200cبندی'}
              </button>
              <button onClick={resetForm} className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-bold hover:bg-gray-300 transition-colors">لغو</button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">در حال بارگذاری...</div>
          ) : categories.length === 0 ? (
            <div className="p-8 text-center text-gray-500">دسته\u200cبندی\u200cای وجود ندارد</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-right text-sm font-bold text-gray-600">ردیف</th>
                    <th className="px-6 py-4 text-right text-sm font-bold text-gray-600">نام</th>
                    <th className="px-6 py-4 text-right text-sm font-bold text-gray-600">لینک</th>
                    <th className="px-6 py-4 text-right text-sm font-bold text-gray-600">آیکون</th>
                    <th className="px-6 py-4 text-right text-sm font-bold text-gray-600">تعداد اخبار</th>
                    <th className="px-6 py-4 text-right text-sm font-bold text-gray-600">عملیات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {categories.map((cat, idx) => (
                    <tr key={cat.id} id={`cat-${cat.id}`} className={`transition-colors scroll-mt-40 ${cat.slug === catSlug ? 'bg-[#C9A96E]/10 border-r-4 border-r-[#C9A96E]' : 'hover:bg-gray-50'}`}>
                      <td className="px-6 py-4 text-sm text-gray-500">{idx + 1}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {cat.icon && <span className="text-lg">{cat.icon}</span>}
                          <span className="font-bold text-sm text-[#1B365D]">{cat.name}</span>
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color || '#1B365D' }} />
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 font-mono" dir="ltr">{cat.slug}</td>
                      <td className="px-6 py-4 text-lg">{cat.icon || '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{cat._count.articles} خبر</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button onClick={() => router.push(`/dashboard/articles?cat=${cat.slug}`)} className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-xs font-bold hover:bg-blue-200 transition-colors">ویرایش اخبار</button>
                          <button onClick={() => handleDelete(cat.id)} className="px-3 py-1 bg-red-100 text-red-700 rounded text-xs font-bold hover:bg-red-200 transition-colors">حذف</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
