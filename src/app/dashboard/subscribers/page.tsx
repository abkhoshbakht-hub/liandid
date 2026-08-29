'use client';

import { useEffect, useState } from 'react';

interface Subscriber {
  id: string;
  email: string;
  isActive: boolean;
  createdAt: string;
}

export default function SubscribersPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchSubscribers(); }, []);

  const fetchSubscribers = async () => {
    try {
      const res = await fetch('/api/admin/subscribers');
      const data = await res.json();
      if (data.success) {
        setSubscribers(data.data);
        setCount(data.count);
      }
    } catch {} finally { setLoading(false); }
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    await fetch('/api/admin/subscribers', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, isActive: !isActive }),
    });
    fetchSubscribers();
  };

  const remove = async (id: string) => {
    if (!confirm('آیا مطمئن هستید؟')) return;
    await fetch('/api/admin/subscribers', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    fetchSubscribers();
  };

  const toPersianNumber = (num: number) => {
    const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    return num.toString().replace(/\d/g, d => persianDigits[parseInt(d)]);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-gray-800">مدیریت خبرنامه</h1>
          <p className="text-sm text-gray-400 mt-1">مدیریت اعضای خبرنامه ایمیلی</p>
        </div>
        <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl text-sm font-bold">
          {toPersianNumber(count)} عضو فعال
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-[#C9A96E] border-t-[#1B365D] rounded-full animate-spin" />
        </div>
      ) : subscribers.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <p className="text-gray-400">هنوز عضوی ثبت نشده</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-6 py-3 text-right text-xs font-bold text-gray-500">ایمیل</th>
                  <th className="px-6 py-3 text-right text-xs font-bold text-gray-500">تاریخ عضویت</th>
                  <th className="px-6 py-3 text-right text-xs font-bold text-gray-500">وضعیت</th>
                  <th className="px-6 py-3 text-right text-xs font-bold text-gray-500">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {subscribers.map((sub) => (
                  <tr key={sub.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-700" dir="ltr">{sub.email}</td>
                    <td className="px-6 py-4 text-gray-500 text-xs">{new Date(sub.createdAt).toLocaleDateString('fa-IR')}</td>
                    <td className="px-6 py-4">
                      <span className={`text-[11px] px-2.5 py-1 rounded-full font-bold ${sub.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
                        {sub.isActive ? 'فعال' : 'غیرفعال'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleActive(sub.id, sub.isActive)}
                          className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-colors ${sub.isActive ? 'bg-amber-50 text-amber-600 hover:bg-amber-100' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'}`}
                        >
                          {sub.isActive ? 'غیرفعال' : 'فعال'}
                        </button>
                        <button
                          onClick={() => remove(sub.id)}
                          className="text-xs px-3 py-1.5 rounded-lg font-bold bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                        >
                          حذف
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
