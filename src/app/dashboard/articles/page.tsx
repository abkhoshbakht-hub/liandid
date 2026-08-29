'use client';

import { useState, useEffect, Suspense } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { toPersianDateTime, toPersianNumber } from '@/lib/date';
import ShamsiDateTimePicker from '@/components/admin/ShamsiDateTimePicker';

interface Article {
  id: string;
  title: string;
  slug: string;
  subtitle?: string;
  content: string;
  excerpt?: string;
  featuredImage?: string;
  status: string;
  viewCount: number;
  isFeatured: boolean;
  isBreaking: boolean;
  isPinned: boolean;
  source?: string;
  sourceUrl?: string;
  publishedAt?: string;
  scheduledAt?: string;
  createdAt: string;
  metaTitle?: string;
  metaDesc?: string;
  metaKeywords?: string;
  author: { id: string; name: string };
  category?: { id: string; name: string; slug: string };
  tags: { id: string; name: string }[];
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Tag {
  id: string;
  name: string;
}

export default function ArticlesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-[#C9A96E] border-t-transparent rounded-full" /></div>}>
      <ArticlesContent />
    </Suspense>
  );
}

function ArticlesContent() {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const catSlug = searchParams.get('cat');
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [previewArticle, setPreviewArticle] = useState<Article | null>(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [uploading, setUploading] = useState(false);
  const [socialDialog, setSocialDialog] = useState<{ articleId: string; articleTitle: string } | null>(null);
  const [sharing, setSharing] = useState(false);

  const [form, setForm] = useState({
    title: '',
    subtitle: '',
    content: '',
    excerpt: '',
    featuredImage: '',
    categoryId: '',
    status: 'DRAFT',
    isFeatured: false,
    isBreaking: false,
    isPinned: false,
    source: '',
    sourceUrl: '',
    scheduledAt: '',
    metaTitle: '',
    metaDesc: '',
    metaKeywords: '',
    tagIds: [] as string[],
  });

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isAdmin)) {
      router.push('/secure-a2x-admin');
    }
  }, [isAuthenticated, isAdmin, isLoading, router]);

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      fetchArticles();
      fetchCategories();
      fetchTags();
    }
  }, [isAuthenticated, isAdmin]);

  useEffect(() => {
    if (catSlug && categories.length > 0) {
      const found = categories.find(c => c.slug === catSlug);
      if (found) setFilterCategory(found.id);
    }
  }, [catSlug, categories]);

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterStatus) params.set('status', filterStatus);
      if (filterCategory) params.set('categoryId', filterCategory);
      if (searchQuery) params.set('search', searchQuery);
      
      const res = await fetch(`/api/admin/articles?${params}`);
      const data = await res.json();
      if (data.success) setArticles(data.data);
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/admin/categories');
      const data = await res.json();
      if (data.success) setCategories(data.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchTags = async () => {
    try {
      const res = await fetch('/api/tags');
      const data = await res.json();
      if (data.success) setTags(data.data);
    } catch (error) {
      console.error('Error fetching tags:', error);
    }
  };

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      fetchArticles();
    }
  }, [filterStatus, filterCategory, searchQuery]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setForm({ ...form, featuredImage: data.data.url });
      }
    } catch (error) {
      console.error('Error uploading:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (status?: string) => {
    try {
      const submitData = { ...form, status: status || form.status };
      
      const url = editingArticle
        ? `/api/admin/articles/${editingArticle.id}`
        : '/api/admin/articles';
      
      const res = await fetch(url, {
        method: editingArticle ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });

      const data = await res.json();
      if (data.success) {
        alert(editingArticle ? 'خبر به‌روزرسانی شد' : 'خبر ایجاد شد');
        resetForm();
        fetchArticles();
        if (status === 'PUBLISHED' && data.data) {
          setSocialDialog({ articleId: data.data.id, articleTitle: data.data.title });
        }
      } else {
        alert(data.message || 'خطا در ذخیره خبر');
      }
    } catch (error) {
      console.error('Error saving article:', error);
      alert('خطا در ذخیره خبر');
    }
  };

  const handleEdit = async (article: Article) => {
    setEditingArticle(article);
    setForm({
      title: article.title,
      subtitle: article.subtitle || '',
      content: article.content,
      excerpt: article.excerpt || '',
      featuredImage: article.featuredImage || '',
      categoryId: article.category?.id || '',
      status: article.status,
      isFeatured: article.isFeatured,
      isBreaking: article.isBreaking,
      isPinned: article.isPinned,
      source: article.source || '',
      sourceUrl: article.sourceUrl || '',
      scheduledAt: article.scheduledAt ? article.scheduledAt.slice(0, 16) : '',
      metaTitle: article.metaTitle || '',
      metaDesc: article.metaDesc || '',
      metaKeywords: article.metaKeywords || '',
      tagIds: article.tags.map(t => t.id),
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('آیا از حذف این خبر مطمئن هستید؟')) return;

    try {
      const res = await fetch(`/api/admin/articles/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        alert('خبر حذف شد');
        fetchArticles();
      } else {
        alert(data.message || 'خطا در حذف');
      }
    } catch (error) {
      console.error('Error deleting:', error);
    }
  };

  const handleQuickPublish = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/articles/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'PUBLISHED' }),
      });
      const data = await res.json();
      if (data.success) {
        fetchArticles();
        const article = articles.find(a => a.id === id);
        if (article) setSocialDialog({ articleId: id, articleTitle: article.title });
      } else {
        alert(data.message || 'خطا در انتشار');
      }
    } catch (error) {
      console.error('Error publishing:', error);
    }
  };

  const handleQuickApprove = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/articles/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'PUBLISHED' }),
      });
      const data = await res.json();
      if (data.success) {
        fetchArticles();
        const article = articles.find(a => a.id === id);
        if (article) setSocialDialog({ articleId: id, articleTitle: article.title });
      } else {
        alert(data.message || 'خطا در تایید');
      }
    } catch (error) {
      console.error('Error approving:', error);
    }
  };

  const handleShareSocial = async (platforms: string[]) => {
    if (!socialDialog) return;
    setSharing(true);
    try {
      const res = await fetch('/api/admin/articles/share-social', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleId: socialDialog.articleId, platforms }),
      });
      const data = await res.json();
      if (data.success) {
        const results = data.data;
        const msgs = results.map((r: any) => `${r.platform}: ${r.success ? 'ارسال شد' : r.error}`).join('\n');
        alert(msgs);
      } else {
        alert(data.message || 'خطا در اشتراک‌گذاری');
      }
    } catch (error) {
      alert('خطا در اشتراک‌گذاری');
    } finally {
      setSharing(false);
      setSocialDialog(null);
    }
  };

  const resetForm = () => {
    setForm({
      title: '', subtitle: '', content: '', excerpt: '', featuredImage: '',
      categoryId: '', status: 'DRAFT', isFeatured: false, isBreaking: false,
      isPinned: false, source: '', sourceUrl: '', scheduledAt: '',
      metaTitle: '', metaDesc: '', metaKeywords: '', tagIds: [],
    });
    setEditingArticle(null);
    setShowForm(false);
  };

  const openPreview = () => {
    setPreviewArticle({
      id: 'preview',
      title: form.title || 'عنوان خبر',
      slug: 'preview',
      subtitle: form.subtitle,
      content: form.content,
      excerpt: form.excerpt,
      featuredImage: form.featuredImage,
      status: form.status,
      viewCount: 0,
      isFeatured: form.isFeatured,
      isBreaking: form.isBreaking,
      isPinned: form.isPinned,
      source: form.source,
      sourceUrl: form.sourceUrl,
      createdAt: new Date().toISOString(),
      author: { id: '', name: 'پیش‌نمایش' },
      category: categories.find(c => c.id === form.categoryId) as any,
      tags: tags.filter(t => form.tagIds.includes(t.id)),
    });
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { label: string; color: string }> = {
      DRAFT: { label: 'پیش‌نویس', color: 'bg-gray-100 text-gray-700' },
      PENDING: { label: 'در انتظار تایید', color: 'bg-yellow-100 text-yellow-700' },
      PUBLISHED: { label: 'منتشر شده', color: 'bg-green-100 text-green-700' },
      ARCHIVED: { label: 'آرشیو', color: 'bg-red-100 text-red-700' },
    };
    const badge = badges[status] || badges.DRAFT;
    return <span className={`px-2 py-1 rounded-full text-xs font-bold ${badge.color}`}>{badge.label}</span>;
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
            <h1 className="text-xl font-bold">مدیریت اخبار</h1>
          </div>
          <button onClick={() => { resetForm(); setShowForm(!showForm); }} className="px-4 py-2 bg-[#C9A96E] text-[#1B365D] rounded-lg font-bold hover:bg-[#d4b87a] transition-colors">
            {showForm ? 'بستن فرم' : '+ خبر جدید'}
          </button>
        </div>
      </div>

      <div className="site-container py-8">
        {catSlug && categories.length > 0 && (() => {
          const activeCat = categories.find(c => c.slug === catSlug);
          if (!activeCat) return null;
          return (
            <div className="bg-[#1B365D]/5 border border-[#C9A96E]/30 rounded-xl px-6 py-4 mb-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-3 h-3 rounded-full bg-[#C9A96E]" />
                <div>
                  <span className="text-sm text-gray-500">اخبار دسته:</span>
                  <span className="text-sm font-bold text-[#1B365D] mr-2">{activeCat.name}</span>
                </div>
              </div>
              <Link href="/dashboard/categories" className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-xs font-bold hover:bg-gray-300 transition-colors">مدیریت دسته‌بندی‌ها</Link>
            </div>
          );
        })()}
        {/* فرم ایجاد/ویرایش خبر */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-200">
            <h2 className="text-xl font-bold text-[#1B365D] mb-6">{editingArticle ? 'ویرایش خبر' : 'خبر جدید'}</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* ستون اصلی */}
              <div className="lg:col-span-2 space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">تیتر خبر *</label>
                  <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#C9A96E] text-lg" placeholder="تیتر خبر را وارد کنید" />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">زیرتیتر</label>
                  <input type="text" value={form.subtitle} onChange={e => setForm({ ...form, subtitle: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#C9A96E]" placeholder="زیرتیتر خبر" />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">خلاصه خبر</label>
                  <textarea value={form.excerpt} onChange={e => setForm({ ...form, excerpt: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#C9A96E]" rows={2} placeholder="خلاصه کوتاه خبر" />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">متن کامل خبر *</label>
                  <textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#C9A96E] min-h-[300px]" placeholder="متن کامل خبر را اینجا بنویسید..." />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">منبع خبر</label>
                    <input type="text" value={form.source} onChange={e => setForm({ ...form, source: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#C9A96E]" placeholder="مثلا: ایرنا" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">لینک منبع</label>
                    <input type="url" value={form.sourceUrl} onChange={e => setForm({ ...form, sourceUrl: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#C9A96E]" placeholder="https://..." />
                  </div>
                </div>
              </div>

              {/* ستون کناری */}
              <div className="space-y-4">
                {/* عکس شاخص */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <label className="block text-sm font-bold text-gray-700 mb-3">عکس شاخص</label>
                  {form.featuredImage ? (
                    <div className="relative">
                      <Image src={form.featuredImage} alt="پیش‌نمایش" width={400} height={200} className="w-full h-40 object-cover rounded-lg" />
                      <button onClick={() => setForm({ ...form, featuredImage: '' })} className="absolute top-2 left-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center">✕</button>
                    </div>
                  ) : (
                    <label className="block w-full h-40 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-[#C9A96E] transition-colors">
                      <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      <span className="text-sm text-gray-500">{uploading ? 'در حال آپلود...' : 'انتخاب عکس'}</span>
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploading} />
                    </label>
                  )}
                </div>

                {/* دسته‌بندی */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <label className="block text-sm font-bold text-gray-700 mb-3">دسته‌بندی</label>
                  <select value={form.categoryId} onChange={e => setForm({ ...form, categoryId: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#C9A96E]">
                    <option value="">انتخاب دسته‌بندی</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                {/* وضعیت */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <label className="block text-sm font-bold text-gray-700 mb-3">وضعیت</label>
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#C9A96E]">
                    <option value="DRAFT">پیش‌نویس</option>
                    <option value="PENDING">در انتظار تایید</option>
                    <option value="PUBLISHED">انتشار</option>
                    <option value="ARCHIVED">آرشیو</option>
                  </select>
                </div>

                {/* تنظیمات */}
                <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                  <label className="block text-sm font-bold text-gray-700 mb-2">تنظیمات</label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.isFeatured} onChange={e => setForm({ ...form, isFeatured: e.target.checked })} className="w-4 h-4 text-[#C9A96E] rounded" />
                    <span className="text-sm">خبر ویژه</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.isBreaking} onChange={e => setForm({ ...form, isBreaking: e.target.checked })} className="w-4 h-4 text-[#C9A96E] rounded" />
                    <span className="text-sm">خبر فوری</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.isPinned} onChange={e => setForm({ ...form, isPinned: e.target.checked })} className="w-4 h-4 text-[#C9A96E] rounded" />
                    <span className="text-sm">سنجاق شده</span>
                  </label>
                </div>

                {/* زمان‌بندی */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <label className="block text-sm font-bold text-gray-700 mb-3">زمان انتشار</label>
                  <ShamsiDateTimePicker value={form.scheduledAt} onChange={(iso) => setForm({ ...form, scheduledAt: iso })} />
                </div>

                {/* SEO */}
                <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                  <label className="block text-sm font-bold text-gray-700 mb-2">تنظیمات SEO</label>
                  <input type="text" value={form.metaTitle} onChange={e => setForm({ ...form, metaTitle: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#C9A96E] text-sm" placeholder="عنوان متا" />
                  <textarea value={form.metaDesc} onChange={e => setForm({ ...form, metaDesc: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#C9A96E] text-sm" rows={2} placeholder="توضیحات متا" />
                  <input type="text" value={form.metaKeywords} onChange={e => setForm({ ...form, metaKeywords: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#C9A96E] text-sm" placeholder="کلمات کلیدی (با کاما)" />
                </div>

                {/* دکمه‌ها */}
                <div className="space-y-2">
                  <button onClick={openPreview} className="w-full px-4 py-3 bg-gray-200 text-gray-700 rounded-lg font-bold hover:bg-gray-300 transition-colors">
                    👁️ پیش‌نمایش
                  </button>
                  <button onClick={() => handleSubmit('DRAFT')} className="w-full px-4 py-3 bg-gray-500 text-white rounded-lg font-bold hover:bg-gray-600 transition-colors">
                    💾 ذخیره پیش‌نویس
                  </button>
                  <button onClick={() => handleSubmit('PENDING')} className="w-full px-4 py-3 bg-yellow-500 text-white rounded-lg font-bold hover:bg-yellow-600 transition-colors">
                    📤 ارسال برای تایید
                  </button>
                  {(isAdmin) && (
                    <button onClick={() => handleSubmit('PUBLISHED')} className="w-full px-4 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-colors">
                      🚀 انتشار
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* فیلترها */}
        <div className="bg-white rounded-xl p-6 mb-6 shadow-sm border border-gray-100">
          <div className="flex flex-wrap gap-4 items-center">
            <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="جستجو در اخبار..." className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#C9A96E] text-sm flex-1 min-w-[200px]" />
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#C9A96E] text-sm">
              <option value="">همه وضعیت‌ها</option>
              <option value="DRAFT">پیش‌نویس</option>
              <option value="PENDING">در انتظار تایید</option>
              <option value="PUBLISHED">منتشر شده</option>
              <option value="ARCHIVED">آرشیو</option>
            </select>
            <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#C9A96E] text-sm">
              <option value="">همه دسته‌بندی‌ها</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* لیست اخبار */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">در حال بارگذاری...</div>
          ) : articles.length === 0 ? (
            <div className="p-8 text-center text-gray-500">خبری یافت نشد</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-right text-sm font-bold text-gray-600">عنوان</th>
                    <th className="px-6 py-4 text-right text-sm font-bold text-gray-600">نویسنده</th>
                    <th className="px-6 py-4 text-right text-sm font-bold text-gray-600">دسته‌بندی</th>
                    <th className="px-6 py-4 text-right text-sm font-bold text-gray-600">وضعیت</th>
                    <th className="px-6 py-4 text-right text-sm font-bold text-gray-600">تاریخ</th>
                    <th className="px-6 py-4 text-right text-sm font-bold text-gray-600">عملیات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {articles.map(article => (
                    <tr key={article.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {article.featuredImage && (
                            <Image src={article.featuredImage} alt="" width={48} height={36} className="w-12 h-9 object-cover rounded" />
                          )}
                          <div>
                            <div className="font-bold text-sm text-[#1B365D]">{article.title}</div>
                            {article.isBreaking && <span className="text-xs text-red-500 font-bold">فوری</span>}
                            {article.isFeatured && <span className="text-xs text-[#C9A96E] font-bold mr-1">ویژه</span>}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{article.author.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{article.category?.name || '-'}</td>
                      <td className="px-6 py-4">{getStatusBadge(article.status)}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{toPersianDateTime(article.createdAt)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {article.status === 'PENDING' && (
                            <button onClick={() => handleQuickApprove(article.id)} className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded text-xs font-bold hover:bg-emerald-200 transition-colors">تایید</button>
                          )}
                          {article.status === 'APPROVED' && (
                            <button onClick={() => handleQuickPublish(article.id)} className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-xs font-bold hover:bg-blue-200 transition-colors">انتشار</button>
                          )}
                          {article.status !== 'PUBLISHED' && article.status !== 'APPROVED' && article.status !== 'PENDING' && (
                            <button onClick={() => handleQuickPublish(article.id)} className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-xs font-bold hover:bg-blue-200 transition-colors">انتشار</button>
                          )}
                          <button onClick={() => handleEdit(article)} className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-xs font-bold hover:bg-blue-200 transition-colors">ویرایش</button>
                          <button onClick={() => setPreviewArticle(article)} className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-xs font-bold hover:bg-gray-200 transition-colors">مشاهده</button>
                          <button onClick={() => handleDelete(article.id)} className="px-3 py-1 bg-red-100 text-red-700 rounded text-xs font-bold hover:bg-red-200 transition-colors">حذف</button>
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

      {/* مodal پیش‌نمایش */}
      {previewArticle && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setPreviewArticle(null)}>
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h3 className="font-bold text-lg">پیش‌نمایش خبر</h3>
              <button onClick={() => setPreviewArticle(null)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100">✕</button>
            </div>
            <div className="p-6">
              {previewArticle.featuredImage && (
                <Image src={previewArticle.featuredImage} alt="" width={800} height={400} className="w-full h-64 object-cover rounded-xl mb-6" />
              )}
              {previewArticle.category && (
                <span className="inline-block px-3 py-1 bg-[#1B365D] text-white text-xs font-bold rounded-full mb-3">{previewArticle.category.name}</span>
              )}
              <h1 className="text-2xl font-black text-[#1B365D] mb-2">{previewArticle.title}</h1>
              {previewArticle.subtitle && <p className="text-lg text-gray-600 mb-4">{previewArticle.subtitle}</p>}
              {previewArticle.excerpt && <p className="text-sm text-gray-500 mb-4 bg-gray-50 p-3 rounded-lg">{previewArticle.excerpt}</p>}
              <div className="prose prose-lg max-w-none text-gray-700 leading-8 whitespace-pre-wrap">{previewArticle.content}</div>
              {previewArticle.source && (
                <div className="mt-6 pt-4 border-t border-gray-200 text-sm text-gray-500">
                  منبع: {previewArticle.sourceUrl ? <a href={previewArticle.sourceUrl} target="_blank" className="text-[#C9A96E] hover:underline">{previewArticle.source}</a> : previewArticle.source}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* پاپ‌آپ اشتراک‌گذاری در شبکه اجتماعی */}
      {socialDialog && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => !sharing && setSocialDialog(null)}>
          <div className="bg-white rounded-2xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
            <h3 className="font-black text-lg text-[#1B365D] mb-2">اشتراک‌گذاری در شبکه اجتماعی</h3>
            <p className="text-sm text-gray-500 mb-5">
              آیا مایل به انتشار خبر زیر در شبکه‌های اجتماعی هستید؟
            </p>
            <div className="bg-gray-50 rounded-xl p-4 mb-5">
              <p className="font-bold text-sm text-[#1B365D] line-clamp-2">{socialDialog.articleTitle}</p>
            </div>
            <div className="space-y-3 mb-5">
              <button
                disabled={sharing}
                onClick={() => handleShareSocial(['rubika'])}
                className="w-full flex items-center gap-3 px-4 py-3 bg-orange-50 border border-orange-200 rounded-xl hover:bg-orange-100 transition-colors disabled:opacity-50"
              >
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold">ر</div>
                <div className="text-right flex-1">
                  <div className="font-bold text-sm text-gray-800">فقط روبیکا</div>
                  <div className="text-xs text-gray-500">ارسال به کانال روبیکا</div>
                </div>
              </button>
              <button
                disabled={sharing}
                onClick={() => handleShareSocial(['bale'])}
                className="w-full flex items-center gap-3 px-4 py-3 bg-sky-50 border border-sky-200 rounded-xl hover:bg-sky-100 transition-colors disabled:opacity-50"
              >
                <div className="w-8 h-8 bg-sky-500 rounded-full flex items-center justify-center text-white text-xs font-bold">ب</div>
                <div className="text-right flex-1">
                  <div className="font-bold text-sm text-gray-800">فقط بله</div>
                  <div className="text-xs text-gray-500">ارسال به کانال بله</div>
                </div>
              </button>
              <button
                disabled={sharing}
                onClick={() => handleShareSocial(['rubika', 'bale'])}
                className="w-full flex items-center gap-3 px-4 py-3 bg-[#1B365D] text-white rounded-xl hover:bg-[#0f2d52] transition-colors disabled:opacity-50"
              >
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-xs font-bold">+</div>
                <div className="text-right flex-1">
                  <div className="font-bold text-sm">هر دو پلتفرم</div>
                  <div className="text-xs text-white/70">ارسال همزمان به روبیکا و بله</div>
                </div>
              </button>
            </div>
            <button
              disabled={sharing}
              onClick={() => setSocialDialog(null)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-gray-600 font-bold hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              {sharing ? 'در حال ارسال...' : 'نه، ممنون'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
