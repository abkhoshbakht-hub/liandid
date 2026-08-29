'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  permissions: string;
  phone?: string;
  bio?: string;
  avatar?: string;
  isActive: boolean;
  createdAt: string;
  _count: { articles: number };
}

export default function UsersPage() {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'AUTHOR',
    permissions: [] as string[],
    phone: '',
    bio: '',
  });

  const permissionOptions = [
    { value: 'publish', label: 'انتشار مستقیم', desc: 'انتشار اخبار بدون نیاز به تایید مدیر' },
    { value: 'edit_own', label: 'ویرایش اخبار خود', desc: 'ویرایش اخباری که خود نوشته' },
    { value: 'delete_own', label: 'حذف اخبار', desc: 'حذف اخبار خود' },
    { value: 'manage_categories', label: 'مدیریت دسته‌بندی', desc: 'ایجاد و ویرایش دسته‌بندی‌ها' },
    { value: 'manage_media', label: 'مدیریت رسانه', desc: 'آپلود و مدیریت تصاویر' },
    { value: 'view_stats', label: 'مشاهده آمار', desc: 'مشاهده آمار بازدید اخبار' },
    { value: 'manage_comments', label: 'مدیریت نظرات', desc: 'تایید و حذف نظرات' },
  ];

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isAdmin)) {
      router.push('/secure-a2x-admin');
    }
  }, [isAuthenticated, isAdmin, isLoading, router]);

  useEffect(() => {
    if (isAuthenticated && isAdmin) fetchUsers();
  }, [isAuthenticated, isAdmin]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (data.success) setUsers(data.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.name || !form.email) {
      alert('نام و ایمیل الزامی است');
      return;
    }
    if (!editingUser && !form.password) {
      alert('رمز عبور الزامی است');
      return;
    }

    try {
      const url = editingUser
        ? `/api/admin/users/${editingUser.id}`
        : '/api/admin/users';
      
      const res = await fetch(url, {
        method: editingUser ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (data.success) {
        alert(editingUser ? 'کاربر به‌روزرسانی شد' : 'کاربر ایجاد شد');
        resetForm();
        fetchUsers();
      } else {
        alert(data.message || 'خطا');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    let perms: string[] = [];
    try { perms = JSON.parse(user.permissions || '[]'); } catch {}
    setForm({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
      permissions: perms,
      phone: user.phone || '',
      bio: user.bio || '',
    });
    setShowForm(true);
  };

  const handleToggleActive = async (user: User) => {
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !user.isActive }),
      });
      const data = await res.json();
      if (data.success) fetchUsers();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('آیا مطمئنید؟')) return;
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        alert('حذف شد');
        fetchUsers();
      } else {
        alert(data.message || 'خطا در حذف');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const resetForm = () => {
    setForm({ name: '', email: '', password: '', role: 'AUTHOR', permissions: [], phone: '', bio: '' });
    setEditingUser(null);
    setShowForm(false);
  };

  const getRoleBadge = (role: string) => {
    const badges: Record<string, { label: string; color: string }> = {
      ADMIN: { label: 'مدیر کل', color: 'bg-purple-100 text-purple-700' },
      AUTHOR: { label: 'نویسنده', color: 'bg-blue-100 text-blue-700' },
    };
    const badge = badges[role] || { label: role, color: 'bg-gray-100 text-gray-700' };
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
            <h1 className="text-xl font-bold">مدیریت کاربران</h1>
          </div>
          <button onClick={() => { resetForm(); setShowForm(!showForm); }} className="px-4 py-2 bg-[#C9A96E] text-[#1B365D] rounded-lg font-bold hover:bg-[#d4b87a] transition-colors">
            {showForm ? 'بستن' : '+ کاربر جدید'}
          </button>
        </div>
      </div>

      <div className="site-container py-8">
        {showForm && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-200">
            <h2 className="text-lg font-bold text-[#1B365D] mb-4">{editingUser ? 'ویرایش کاربر' : 'کاربر جدید'}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">نام *</label>
                <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#C9A96E]" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">ایمیل *</label>
                <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#C9A96E] ltr" dir="ltr" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">{editingUser ? 'رمز جدید (خالی = بدون تغییر)' : 'رمز عبور *'}</label>
                <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#C9A96E]" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">نقش</label>
                <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#C9A96E]">
                  <option value="ADMIN">مدیر کل</option>
                  <option value="AUTHOR">نویسنده</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">تلفن</label>
                <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#C9A96E] ltr" dir="ltr" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">بیو</label>
                <input type="text" value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#C9A96E]" />
              </div>
            </div>

            {/* سطوح دسترسی */}
            {form.role === 'AUTHOR' && (
              <div className="mt-4">
                <label className="block text-sm font-bold text-gray-700 mb-3">سطوح دسترسی نویسنده</label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {permissionOptions.map(perm => (
                    <label key={perm.value} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-[#C9A96E] cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={form.permissions.includes(perm.value)}
                        onChange={e => {
                          if (e.target.checked) {
                            setForm({ ...form, permissions: [...form.permissions, perm.value] });
                          } else {
                            setForm({ ...form, permissions: form.permissions.filter(p => p !== perm.value) });
                          }
                        }}
                        className="w-4 h-4 mt-0.5 text-[#C9A96E] rounded"
                      />
                      <div>
                        <div className="text-sm font-bold text-gray-700">{perm.label}</div>
                        <div className="text-xs text-gray-500">{perm.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}
            <div className="flex gap-2 mt-4">
              <button onClick={handleSubmit} className="px-6 py-2 bg-[#1B365D] text-white rounded-lg font-bold hover:bg-[#2E5090] transition-colors">
                {editingUser ? 'ذخیره تغییرات' : 'ایجاد کاربر'}
              </button>
              <button onClick={resetForm} className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-bold hover:bg-gray-300 transition-colors">لغو</button>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">در حال بارگذاری...</div>
          ) : users.length === 0 ? (
            <div className="p-8 text-center text-gray-500">کاربری یافت نشد</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-right text-sm font-bold text-gray-600">نام</th>
                    <th className="px-4 py-3 text-right text-sm font-bold text-gray-600">ایمیل</th>
                    <th className="px-4 py-3 text-right text-sm font-bold text-gray-600">نقش</th>
                    <th className="px-4 py-3 text-right text-sm font-bold text-gray-600">اخبار</th>
                    <th className="px-4 py-3 text-right text-sm font-bold text-gray-600">وضعیت</th>
                    <th className="px-4 py-3 text-right text-sm font-bold text-gray-600">عملیات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map(user => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-bold text-sm text-[#1B365D]">{user.name}</div>
                        {user.phone && <div className="text-xs text-gray-500" dir="ltr">{user.phone}</div>}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 font-mono" dir="ltr">{user.email}</td>
                      <td className="px-4 py-3">{getRoleBadge(user.role)}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{user._count.articles}</td>
                      <td className="px-4 py-3">
                        <button onClick={() => handleToggleActive(user)} className={`px-2 py-1 rounded-full text-xs font-bold ${user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {user.isActive ? 'فعال' : 'غیرفعال'}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button onClick={() => handleEdit(user)} className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-xs font-bold hover:bg-blue-200 transition-colors">ویرایش</button>
                          <button onClick={() => handleDelete(user.id)} className="px-3 py-1 bg-red-100 text-red-700 rounded text-xs font-bold hover:bg-red-200 transition-colors">حذف</button>
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
